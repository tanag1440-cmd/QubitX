// ── Shared tutor chat surface ────────────────────────────────────────────────
// One set of chat components used by BOTH the docked copilot and the full
// /tutor page, so the two surfaces can never drift apart.

import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, User as UserIcon, Wand2 } from "lucide-react";
import { GroundedChip } from "../learning";
import { TUTOR_MODES, type AiTutorMode } from "../../lib/learning/aiService";
import type { TutorMessage } from "../../lib/tutorContext";
import { useI18n } from "../../lib/i18n";

/** A small badge naming which page context the tutor is reading from. */
export function ContextChip({ title, kind, hasCircuit }: { title: string; kind: string; hasCircuit: boolean }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
        {t("relevantNow")}: {title}
      </span>
      {hasCircuit && (
        <span className="rounded-md border border-qx-violet/25 bg-qx-violet/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-qx-violet">
          live circuit
        </span>
      )}
      {!hasCircuit && kind !== "generic" && (
        <span className="rounded-md border border-line bg-card2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2">
          {kind}
        </span>
      )}
    </div>
  );
}

export function TutorMessageList({
  messages,
  typing,
  onFollowUp,
  compact = false,
  className = "",
}: {
  messages: TutorMessage[];
  typing: boolean;
  onFollowUp: (text: string) => void;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  return (
    <div className={`space-y-4 overflow-y-auto ${compact ? "p-3.5" : "p-5"} ${className}`}>
      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg ${
              compact ? "h-7 w-7" : "h-8 w-8"
            } ${
              m.role === "user"
                ? "bg-qx-violet/20 text-qx-violet"
                : "bg-accent text-white"
            }`}
          >
            {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </span>
          <div className={`min-w-0 max-w-[86%] ${m.role === "user" ? "" : "space-y-2"}`}>
            <div
              className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-tr-sm bg-qx-violet/15 text-ink"
                  : "rounded-tl-sm border border-line bg-card2/70 text-ink"
              }`}
            >
              {m.mode && m.role === "bot" && (
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-accent">
                  {TUTOR_MODES.find((t) => t.id === m.mode)?.label}
                </span>
              )}
              {m.text}
              {m.rephraseLabel && (
                <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wider text-accent">
                  {m.rephraseLabel}
                </span>
              )}
            </div>

            {m.grounded && m.grounded.length > 0 && (
              <div className="rounded-xl border border-line bg-page/60 p-3">
                <GroundedChip label="From this page & your learning data" />
                <ul className="mt-2 space-y-1">
                  {m.grounded.map((g, i) => (
                    <li key={i} className="text-xs leading-relaxed text-ink-2">• {g}</li>
                  ))}
                </ul>
              </div>
            )}

            {m.followUps && m.followUps.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {m.followUps.map((f) => (
                  <button
                    key={f}
                    onClick={() => onFollowUp(f)}
                    disabled={typing}
                    className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {typing && (
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
            <Bot className="h-4 w-4" />
          </span>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-card2/70 px-4 py-3.5">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" />
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export function TutorModeChips({
  mode,
  onSelect,
  className = "",
}: {
  mode: AiTutorMode;
  onSelect: (id: AiTutorMode) => void;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {TUTOR_MODES.map((modeDef) => (
        <button
          key={modeDef.id}
          onClick={() => onSelect(modeDef.id)}
          title={modeDef.hint}
          className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
            mode === modeDef.id
              ? "border-qx-violet/60 bg-qx-violet/15 text-ink"
              : "border-line bg-card2 text-ink-2 hover:bg-card2"
          }`}
        >
          {t(modeDef.id === "step" ? "stepByStep" : modeDef.id)}
        </button>
      ))}
    </div>
  );
}

export function TutorQuickPrompts({
  prompts,
  onPick,
  disabled,
  className = "",
}: {
  prompts: string[];
  onPick: (p: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  if (prompts.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onPick(p)}
          disabled={disabled}
          className="rounded-full border border-line bg-card2/60 px-2.5 py-1 text-xs text-ink-2 transition hover:border-qx-violet/40 hover:bg-qx-violet/10 hover:text-ink disabled:opacity-50"
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function TutorRephraseRow({
  onRephrase,
  disabled,
}: {
  onRephrase: (mode: "simple" | "analogy" | "math" | "deeper", label: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const options: [("simple" | "analogy" | "math" | "deeper"), string][] = [
    ["simple", t("explainSimply")],
    ["analogy", t("analogy")],
    ["math", t("showMath")],
    ["deeper", t("goDeeper")],
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-line bg-page/50 px-3 py-2">
      <Wand2 className="h-3.5 w-3.5 shrink-0 text-qx-violet" />
      {options.map(([km, label]) => (
        <button
          key={km}
          onClick={() => onRephrase(km, label)}
          disabled={disabled}
          className="rounded-full border border-line bg-card2 px-2.5 py-1 text-[11px] font-medium text-ink-2 transition hover:border-qx-violet/40 hover:text-qx-violet disabled:opacity-50"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TutorComposer({
  onSend,
  typing,
  placeholder,
  compact = false,
}: {
  onSend: (text: string) => void;
  typing: boolean;
  placeholder: string;
  compact?: boolean;
}) {
  const [input, setInput] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.trim() || typing) return;
        onSend(input);
        setInput("");
      }}
      className={`flex items-center gap-2 border-t border-line ${compact ? "p-2.5" : "p-3"}`}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        aria-label="Ask the Qubit-X AI Tutor"
        className="min-w-0 flex-1 rounded-xl border border-line bg-card2/80 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-qx-violet/60 focus:outline-none focus:ring-2 focus:ring-qx-violet/20"
      />
      <button
        type="submit"
        disabled={!input.trim() || typing}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-strong disabled:opacity-40"
        aria-label="Send"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
