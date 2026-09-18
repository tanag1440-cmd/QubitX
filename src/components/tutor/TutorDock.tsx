// ── TutorDock: the always-available copilot entry point ──────────────────────
// A small launcher on every in-app page that opens a docked side rail on large
// screens (narrowing the content rather than covering it) and a bottom sheet on
// smaller ones. The panel body is lazy-loaded so it costs nothing until used.

import React, { Suspense, lazy, useEffect } from "react";
import { Bot } from "lucide-react";
import { useTutor } from "../../lib/tutorContext";

const TutorPanel = lazy(() => import("./TutorPanel"));

export function TutorDock() {
  const { open, toggle, setOpen, dockVisible, unread, hasActionableContext } = useTutor();

  // ⌘/Ctrl+I toggles; Esc closes.
  useEffect(() => {
    if (!dockVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && open) {
        const el = document.activeElement;
        const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
        // Only hijack Esc when the learner isn't typing in the composer.
        if (!typing) setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dockVisible, open, toggle, setOpen]);

  if (!dockVisible) return null;

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={toggle}
          aria-label="Open the AI Tutor"
          title="Ask the AI Tutor (Ctrl+I)"
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-line bg-card2/90 px-4 py-3 text-sm font-semibold text-ink  transition hover:border-qx-violet/50 hover:bg-card sm:bottom-6 sm:right-6"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent">
            <Bot className="h-4 w-4 text-white" />
            {hasActionableContext && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-page" />
            )}
          </span>
          <span className="hidden sm:inline">Ask AI Tutor</span>
          <kbd className="hidden rounded border border-line bg-card2 px-1.5 py-0.5 font-mono text-[10px] text-ink-2 lg:inline">
            Ctrl I
          </kbd>
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-qx-rose px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {/* Panel: side rail on lg+, bottom sheet below */}
      {open && (
        <aside
          role="complementary"
          aria-label="Qubit-X AI Tutor"
          className="fixed z-40 flex flex-col overflow-hidden border-line bg-page/95 shadow-2xl -xl
            inset-x-0 bottom-0 h-[82vh] rounded-t-2xl border-t
            lg:inset-x-auto lg:bottom-0 lg:left-auto lg:right-0 lg:top-16 lg:h-auto lg:w-[380px] lg:rounded-none lg:border-l lg:border-t-0"
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center gap-2 text-sm text-ink-3">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" />
                Loading tutor…
              </div>
            }
          >
            <TutorPanel />
          </Suspense>
        </aside>
      )}
    </>
  );
}
