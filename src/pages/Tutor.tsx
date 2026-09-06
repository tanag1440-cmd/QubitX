import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User as UserIcon, Wand2 } from "lucide-react";
import { Badge, Card } from "../components/ui";
import { answerQuery, QUICK_PROMPTS, relatedTopics, type TutorMode } from "../lib/aiTutor";
import { useStore } from "../lib/store";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  simple?: string;
  example?: string;
  deeper?: string;
  math?: string;
  rephraseLabel?: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi, I'm Qubit Tutor! 👋 I explain quantum computing in plain language — no math background needed. Try asking:\n\n• What is a qubit?\n• Explain superposition like I'm 10\n• What does the Hadamard gate do?\n\nOr pick a quick prompt below.",
};

export default function Tutor() {
  const { askTutor } = useStore();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstAsk = useRef(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const respond = (question: string, mode: TutorMode = "simple") => {
    const res = answerQuery(question, mode);
    const msg: Message = {
      id: crypto.randomUUID(),
      role: "bot",
      text: res.simple,
      simple: res.simple,
      example: res.example,
      deeper: res.deeper,
      math: res.math,
    };
    setMessages((m) => [...m, msg]);
  };

  const ask = (text: string, mode: TutorMode = "simple") => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q }]);
    setTyping(true);
    if (firstAsk.current) {
      firstAsk.current = false;
      askTutor(); // unlock Curious Mind achievement
      setAsked(true);
    }
    setTimeout(() => {
      respond(q, mode);
      setTyping(false);
    }, 500 + Math.random() * 500);
  };

  const rephrase = (mode: TutorMode, label: string) => {
    const last = [...messages].reverse().find((m) => m.role === "user");
    if (!last) return;
    const key = mode === "simple" ? "simple" : mode === "analogy" ? "example" : mode === "math" ? "math" : "deeper";
    // find last bot message for the current question
    const botIdx = [...messages].reverse().findIndex((m) => m.role === "bot");
    if (botIdx === -1) return;
    const bot = [...messages].reverse()[botIdx];
    const text = bot[key];
    if (!text) return;
    setMessages((m) => [
      ...m.slice(0, m.length - botIdx - 1),
      { ...bot, text, rephraseLabel: label },
    ]);
  };

  const suggest = (topic: string) => {
    const t = topic.replace(/-/g, " ");
    ask(`Tell me about ${t}?`);
  };

  const lastUserQuestion = [...messages].reverse().find((m) => m.role === "user")?.text;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-qx-violet to-qx-cyan shadow-glow">
              <Bot className="h-5.5 w-5.5 text-white" />
            </span>
            Qubit Tutor
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your patient quantum explainer. Ask anything — get simple answers, analogies, and optional math.
          </p>
        </div>
        <Badge color="cyan">
          <Sparkles className="h-3 w-3" /> Prototype AI · curated knowledge base
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* chat */}
        <Card className="flex h-[62vh] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    m.role === "user" ? "bg-qx-violet/20 text-qx-violet" : "bg-gradient-to-br from-qx-violet to-qx-cyan text-white"
                  }`}
                >
                  {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" ? "rounded-tr-sm bg-qx-violet/15 text-slate-100" : "rounded-tl-sm border border-white/10 bg-ink-900/70 text-slate-200"
                  }`}
                >
                  {m.text}
                  {"rephraseLabel" in m && m.rephraseLabel && (
                    <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wider text-qx-cyan">{m.rephraseLabel}</span>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-qx-violet to-qx-cyan text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-ink-900/70 px-4 py-3.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-qx-cyan" />
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-qx-cyan [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-qx-cyan [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* quick prompts + mode */}
          {lastUserQuestion && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 bg-ink-950/50 px-4 py-2.5">
              <Wand2 className="h-3.5 w-3.5 text-qx-violet" />
              {([
                ["simple", "Explain simply"],
                ["analogy", "Give an analogy"],
                ["math", "Show the math"],
                ["deeper", "Go deeper"],
              ] as [TutorMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => rephrase(mode, label)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-qx-violet/40 hover:text-qx-violet"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-white/5 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about qubits, superposition, Grover's algorithm…"
              className="flex-1 rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-qx-violet/60 focus:outline-none focus:ring-2 focus:ring-qx-violet/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-qx-violet to-qx-indigo text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </Card>

        {/* side panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 font-semibold text-white">Try asking</h3>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  disabled={typing}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left text-sm text-slate-300 transition hover:border-qx-violet/40 hover:bg-qx-violet/10 hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 font-semibold text-white">Keep exploring</h3>
            {lastUserQuestion ? (
              <div className="flex flex-wrap gap-2">
                {relatedTopics(lastUserQuestion).map((t) => (
                  <button
                    key={t}
                    onClick={() => suggest(t)}
                    disabled={typing}
                    className="rounded-full border border-qx-cyan/30 bg-qx-cyan/10 px-3 py-1 text-xs font-medium text-qx-cyan transition hover:bg-qx-cyan/20"
                  >
                    {t.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Ask a question and I'll suggest related topics.</p>
            )}
          </Card>

          <Card className="border-qx-amber/20 bg-qx-amber/5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-qx-amber">How this works</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              This prototype tutor answers from a curated knowledge base of verified quantum concepts — it never
              invents facts. The interface is built so a real LLM API (with retrieval over vetted content) can be
              connected later via an environment variable. {asked && "Thanks for the first question — you earned the Curious Mind achievement! 🏅"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}