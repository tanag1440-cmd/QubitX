// ── Page-aware AI Tutor provider ─────────────────────────────────────────────
// Owns the single tutor conversation (so it survives navigation and reloads)
// and the page-context registry that lets any page publish what the learner is
// currently looking at.
//
// Design notes:
//  • One engine, two surfaces. The dock and the /tutor page both call the same
//    deterministic service in `learning/aiService` — there is no second AI path.
//  • Context is tagged with the pathname it was registered for, so a page's
//    context is never displayed on a different route (no stale "your circuit").
//  • Registrations are de-duplicated by signature, so pages can register a
//    fresh object every render without causing render loops.

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { useLocation } from "react-router-dom";
import type { CircuitOp, TopicId } from "../types";
import { answerQuery, type TutorMode as KnowledgeMode } from "./aiTutor";
import {
  isAdviceQuestion, matchTopic, tutorRespond, type AiTutorMode, type TutorContext as ServiceContext,
} from "./learning/aiService";
import { useStore } from "./store";
import { useI18n } from "./i18n";

export type PageKind =
  | "lesson" | "learn" | "lab" | "visualize" | "algorithms" | "algorithm"
  | "challenges" | "challenge" | "experiment" | "diagnostic" | "dashboard"
  | "progress" | "achievements" | "profile" | "resources" | "admin" | "generic";

/** What a page publishes so the tutor knows what is on screen. */
export interface PageContext {
  kind: PageKind;
  title: string;
  subtitle?: string;
  topicId?: TopicId | null;
  /** The circuit currently on screen (may be unsaved and in progress). */
  circuit?: { ops: CircuitOp[]; numQubits: number } | null;
  /** Facts already computed by the app — quoted verbatim, never re-invented. */
  facts?: string[];
  /** Quick prompts relevant to this exact page state. */
  prompts?: string[];
  /** The question the learner is looking at (e.g. the current quiz item). */
  focus?: { question: string; note?: string };
}

export interface TutorMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  mode?: AiTutorMode;
  grounded?: string[];
  followUps?: string[];
  rephraseLabel?: string;
}

// Kept module-private so this file's exports stay Fast-Refresh friendly.
const WELCOME_MESSAGE: TutorMessage = {
  id: "welcome",
  role: "bot",
  text: "Hi, I'm the Qubit-X AI Tutor. 👋 I stay with you on every page — and I can see what you're working on, so you don't have to explain it twice.\n\nTry asking about the lesson you're reading, the circuit you're building, or the challenge you're stuck on.",
  followUps: ["What is a qubit?", "Explain superposition like I'm 10"],
};

/** Routes where the copilot is intentionally absent (marketing + auth). */
const HIDDEN_ROUTES = ["/", "/login", "/signup", "/forgot-password"];

const isDockRoute = (pathname: string) =>
  !HIDDEN_ROUTES.includes(pathname) && !pathname.startsWith("/tutor");

// Module-private so this file's remaining exports stay Fast-Refresh friendly.
function defaultPageContext(pathname: string): PageContext {
  if (pathname.startsWith("/learn/"))
    return { kind: "lesson", title: "Lesson", prompts: ["Explain this concept simply", "Give me an example"] };
  if (pathname === "/learn")
    return { kind: "learn", title: "Lessons", prompts: ["Which lesson should I take next?", "Explain superposition"] };
  if (pathname === "/lab")
    return { kind: "lab", title: "Quantum Lab", prompts: ["How do I build a Bell state?", "What does CNOT do?"] };
  if (pathname === "/visualize")
    return { kind: "visualize", title: "Visualize", prompts: ["Explain superposition", "What is a Bloch sphere?"] };
  if (pathname.startsWith("/algorithms/"))
    return { kind: "algorithm", title: "Algorithm", prompts: ["Explain this algorithm step by step", "Why is it faster?"] };
  if (pathname === "/algorithms")
    return { kind: "algorithms", title: "Algorithms", prompts: ["Which algorithm should I learn first?"] };
  if (pathname === "/ai-challenges")
    return { kind: "challenge", title: "AI Challenges", prompts: ["Give me a hint", "How does validation work?"] };
  if (pathname === "/experiments")
    return { kind: "experiment", title: "Experiment Mode", prompts: ["What does removing a gate do?", "What is interference?"] };
  if (pathname === "/diagnostic")
    return { kind: "diagnostic", title: "Diagnostic", prompts: ["I'm not sure about this question"] };
  if (pathname === "/dashboard")
    return { kind: "dashboard", title: "Dashboard", prompts: ["What should I learn next?", "How am I doing?"] };
  if (pathname === "/progress")
    return { kind: "progress", title: "Progress", prompts: ["What are my weakest topics?", "How does mastery work?"] };
  if (pathname === "/tutor") return { kind: "generic", title: "AI Tutor", prompts: [] };
  return { kind: "generic", title: "Qubit-X", prompts: ["What is a qubit?", "Explain superposition simply"] };
}

const STORE_KEY = "qubitx.tutor.v1";
const MAX_MESSAGES = 40;

interface Persisted {
  open: boolean;
  mode: AiTutorMode;
  userId: string | null;
  messages: TutorMessage[];
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function signature(path: string, ctx: PageContext): string {
  return JSON.stringify([
    path, ctx.kind, ctx.title, ctx.subtitle, ctx.topicId ?? null,
    ctx.circuit ? `${ctx.circuit.numQubits}|${ctx.circuit.ops.map((o) => `${o.gate}:${o.qubits.join(",")}@${o.col}`).join(";")}` : null,
    ctx.facts ?? null, ctx.prompts ?? null, ctx.focus?.question ?? null, ctx.focus?.note ?? null,
  ]);
}

/** Does the question refer to what's on screen right now, or to the learner's own data? */
const PAGE_REFERENTIAL = /\b(this|my|here|current|above|below|on screen|the circuit|this lesson|this quiz|this question|the challenge|the diagram)\b/i;

interface TutorValue {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
  dockVisible: boolean;
  pageContext: PageContext;
  registerPageContext: (path: string, ctx: PageContext) => void;
  messages: TutorMessage[];
  typing: boolean;
  mode: AiTutorMode;
  setMode: (m: AiTutorMode) => void;
  ask: (text: string, mode?: AiTutorMode) => void;
  rephrase: (m: KnowledgeMode, label: string) => void;
  clear: () => void;
  unread: number;
  askCount: number;
  hasActionableContext: boolean;
}

const TutorCtx = createContext<TutorValue | null>(null);

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const {
    currentUser, topicMasteryList, mistakePatterns, db, askTutor, suggestedNext, overallMasteryValue,
  } = useStore();
  const { tutorLang: language } = useI18n();

  const persisted = useMemo(() => loadPersisted(), []);
  const sameUser = persisted?.userId === (currentUser?.id ?? null);

  const [open, setOpenState] = useState<boolean>(persisted?.open ?? false);
  const [mode, setMode] = useState<AiTutorMode>(persisted?.mode ?? "explain");
  const [messages, setMessages] = useState<TutorMessage[]>(
    sameUser && persisted?.messages?.length ? persisted.messages : [WELCOME_MESSAGE]
  );
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [askCount, setAskCount] = useState(0);

  // Registry of the active page's context (tagged with its pathname).
  const registryRef = useRef<{ path: string; ctx: PageContext; sig: string } | null>(null);
  const [, bump] = useState(0);

  const registerPageContext = useCallback((path: string, ctx: PageContext) => {
    const sig = signature(path, ctx);
    if (registryRef.current?.sig === sig) return;
    registryRef.current = { path, ctx, sig };
    bump((v) => v + 1);
  }, []);

  const pageContext = useMemo<PageContext>(() => {
    const reg = registryRef.current;
    return reg && reg.path === location.pathname ? reg.ctx : defaultPageContext(location.pathname);
  }, [location.pathname, registryRef.current, messages.length, askCount]);

  // Persist the thread + UI state.
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        open, mode, userId: currentUser?.id ?? null, messages: messages.slice(-MAX_MESSAGES),
      }));
    } catch {
      /* storage unavailable — the tutor still works for this session */
    }
  }, [open, mode, messages, currentUser]);

  const dockVisible = isDockRoute(location.pathname);

  // Leaving a dock route closes the panel so it doesn't linger over marketing pages.
  useEffect(() => {
    if (!dockVisible && open) setOpenState(false);
  }, [dockVisible, open]);

  const setOpen = useCallback((v: boolean) => {
    setOpenState(v);
    if (v) setUnread(0);
  }, []);

  const toggle = useCallback(() => setOpenState((v) => {
    if (!v) setUnread(0);
    return !v;
  }), []);

  /** Most recent saved circuit, used when the current page has no live circuit. */
  const latestSavedCircuit = useMemo(() => {
    if (!currentUser) return null;
    const exp = db.experiments.find((e) => e.userId === currentUser.id);
    return exp ? { ops: exp.circuit, numQubits: exp.numQubits, name: exp.name } : null;
  }, [db.experiments, currentUser]);

  const ask = useCallback((text: string, overrideMode?: AiTutorMode) => {
    const question = text.trim();
    if (!question) return;
    const useMode = overrideMode ?? mode;

    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: question }]);
    setTyping(true);

    // Unlock the Curious Mind achievement from whichever surface asked.
    if (askCount === 0) askTutor();
    setAskCount((c) => c + 1);

    const topicId = matchTopic(question) ?? pageContext.topicId ?? null;
    const mastery = topicId
      ? topicMasteryList.find((m) => m.topicId === topicId)?.mastery ?? null
      : null;
    const known = topicId
      ? mistakePatterns.filter((m) => m.topicId === topicId).map((m) => m.label)
      : [];

    // Prefer the circuit actually on screen; fall back to the last saved one.
    const onScreenCircuit = pageContext.circuit ?? null;
    const serviceContext: ServiceContext = {
      language,
      level: currentUser?.level ?? "Beginner",
      topicMastery: mastery,
      topicId,
      knownMistakes: known,
      circuit: onScreenCircuit ?? (latestSavedCircuit
        ? { ops: latestSavedCircuit.ops, numQubits: latestSavedCircuit.numQubits }
        : null),
      // The adaptive engine's own output, so "what should I learn next?" is
      // answered from real data rather than the generic knowledge base.
      recommendations: suggestedNext.map((r) => ({
        title: r.title, reason: r.reason, recommendationType: r.recommendationType,
      })),
      overallMastery: currentUser ? overallMasteryValue : null,
    };

    const res = tutorRespond(question, useMode, serviceContext);

    // Attach page facts only when they're actually relevant, and label where
    // they came from — the tutor never presents page data as its own invention.
    // The page's `focus` note is the most concrete thing on screen (e.g. the
    // answer the learner just submitted), so it leads.
    const referential = PAGE_REFERENTIAL.test(question) || isAdviceQuestion(question);
    const pageGrounded: string[] = [];
    if (referential) {
      if (pageContext.focus?.note) pageGrounded.push(pageContext.focus.note);
      const facts = pageContext.facts ?? [];
      // With a live circuit we quote every page fact; otherwise the top few.
      for (const f of facts.slice(0, onScreenCircuit ? facts.length : 5)) {
        if (!pageGrounded.includes(f)) pageGrounded.push(f);
      }
    }

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: res.answer,
          mode: useMode,
          // Service facts (from the circuit / learning data) first, then what the
          // page itself reported. Bounded, but roomy enough for both channels.
          grounded: [...(res.grounded ?? []), ...pageGrounded].slice(0, 10),
          followUps: res.followUps,
        },
      ]);
      setTyping(false);
      setOpenState((isOpen) => {
        if (!isOpen) setUnread((u) => u + 1);
        return isOpen;
      });
    }, 380 + Math.random() * 320);
  }, [
    mode, askCount, askTutor, pageContext, topicMasteryList, mistakePatterns,
    currentUser, latestSavedCircuit, suggestedNext, overallMasteryValue, language,
  ]);

  const rephrase = useCallback((knowledgeMode: KnowledgeMode, label: string) => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const res = answerQuery(lastUser.text, knowledgeMode);
    const field = knowledgeMode === "simple" ? res.simple
      : knowledgeMode === "analogy" ? res.example
      : knowledgeMode === "math" ? res.math
      : res.deeper;
    setMessages((m) => [...m, {
      id: crypto.randomUUID(), role: "bot", text: field, rephraseLabel: label,
    }]);
  }, [messages, language]);

  const clear = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setUnread(0);
  }, []);

  const hasActionableContext = Boolean(
    pageContext.circuit || pageContext.focus || (pageContext.prompts?.length ?? 0) > 0
  );

  const value = useMemo<TutorValue>(() => ({
    open, toggle, setOpen, dockVisible, pageContext, registerPageContext,
    messages, typing, mode, setMode, ask, rephrase, clear, unread, askCount,
    hasActionableContext,
  }), [
    open, toggle, setOpen, dockVisible, pageContext, registerPageContext,
    messages, typing, mode, ask, rephrase, clear, unread, askCount, hasActionableContext,
  ]);

  return <TutorCtx.Provider value={value}>{children}</TutorCtx.Provider>;
}

export function useTutor(): TutorValue {
  const ctx = useContext(TutorCtx);
  if (!ctx) throw new Error("useTutor must be used inside TutorProvider");
  return ctx;
}

/**
 * Publish the current page's context. Call it with a fresh object each render —
 * the provider de-duplicates by signature, so this is cheap and always current.
 */
export function useRegisterPageContext(ctx: PageContext) {
  const { registerPageContext } = useTutor();
  const pathname = useLocation().pathname;
  useEffect(() => {
    registerPageContext(pathname, ctx);
  });
}
