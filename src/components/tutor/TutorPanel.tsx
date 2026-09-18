// ── The docked copilot panel body (lazy-loaded) ───────────────────────────────
// Renders the shared conversation with the context of whatever page is open.

import React from "react";
import { Link } from "react-router-dom";
import { Bot, Eraser, ShieldCheck, X } from "lucide-react";
import {
  ContextChip, TutorComposer, TutorMessageList, TutorModeChips, TutorQuickPrompts, TutorRephraseRow,
} from "./chat";
import { useTutor } from "../../lib/tutorContext";
import { TUTOR_MODES } from "../../lib/learning/aiService";

export default function TutorPanel() {
  const {
    pageContext, messages, typing, ask, rephrase, mode, setMode, clear, setOpen, askCount,
  } = useTutor();

  const activeMode = TUTOR_MODES.find((t) => t.id === mode);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent">
            <Bot className="h-4 w-4 text-white" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Qubit-X AI Tutor</p>
            <p className="truncate text-[11px] text-ink-3">
              {activeMode ? activeMode.hint : "Ask me anything"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={clear}
            title="Clear conversation"
            aria-label="Clear conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition hover:bg-card2 hover:text-ink-2"
          >
            <Eraser className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            title="Close (Esc)"
            aria-label="Close tutor"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition hover:bg-card2 hover:text-ink-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* context strip — what the tutor can currently see */}
      <div className="space-y-2 border-b border-line bg-page/40 px-3.5 py-2.5">
        <ContextChip
          title={pageContext.title}
          kind={pageContext.kind}
          hasCircuit={Boolean(pageContext.circuit && pageContext.circuit.ops.length > 0)}
        />
        {pageContext.focus && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-ink-3">
            Looking at: <span className="text-ink-2">{pageContext.focus.question}</span>
          </p>
        )}
        <TutorModeChips mode={mode} onSelect={setMode} />
      </div>

      {/* conversation */}
      <TutorMessageList
        messages={messages}
        typing={typing}
        onFollowUp={(t) => ask(t)}
        compact
        className="flex-1"
      />

      {/* context-derived quick prompts */}
      {pageContext.prompts && pageContext.prompts.length > 0 && (
        <div className="border-t border-line px-3.5 py-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
            Relevant right now
          </p>
          <TutorQuickPrompts prompts={pageContext.prompts} onPick={(p) => ask(p)} disabled={typing} />
        </div>
      )}

      <TutorRephraseRow onRephrase={rephrase} disabled={messages.length === 0} />
      <TutorComposer
        onSend={(t) => ask(t)}
        typing={typing}
        compact
        placeholder={`Ask about ${pageContext.title.toLowerCase()}…`}
      />

      <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2 text-[10px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-accent" />
          Grounded — never invents quantum facts
        </span>
        <Link to="/tutor" className="text-accent hover:underline">Full tutor →</Link>
      </div>
      {askCount === 0 && (
        <p className="border-t border-line px-3.5 py-2 text-[10px] text-ink-3">
          Your first question unlocks the <span className="text-qx-amber">Curious Mind</span> badge.
        </p>
      )}
    </div>
  );
}
