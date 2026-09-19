import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bot, CircuitBoard, Command, Sparkles, Trash2 } from "lucide-react";
import { Badge, Card } from "../components/ui";
import {
  ContextChip, TutorComposer, TutorMessageList, TutorModeChips, TutorQuickPrompts, TutorRephraseRow,
} from "../components/tutor/chat";
import { QUICK_PROMPTS } from "../lib/aiTutor";
import { TUTOR_MODES } from "../lib/learning/aiService";
import { topicName } from "../data/learningTopics";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import { useTutor } from "../lib/tutorContext";

export default function Tutor() {
  const { currentUser, topicMasteryList, db, learningProfile, learningMode } = useStore();
  const { t, tutorLang, setTutorLang, languages } = useI18n();
  const { messages, typing, ask, rephrase, mode, setMode, clear, askCount, pageContext } = useTutor();

  const activeMode = TUTOR_MODES.find((t) => t.id === mode)!;

  // For the sidebar we show whichever circuit is currently in context: the one
  // on screen if the page published it, otherwise the learner's latest saved one.
  const latestCircuit = useMemo(() => {
    if (!currentUser) return null;
    const exp = db.experiments.find((e) => e.userId === currentUser.id);
    return exp ? { ops: exp.circuit, numQubits: exp.numQubits, name: exp.name } : null;
  }, [db.experiments, currentUser]);

  const published = pageContext.circuit ?? null;
  const contextCircuit = published && published.ops.length > 0 ? published : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-ink sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Bot className="h-5 w-5 text-white" />
            </span>
            Qubit-X AI Tutor
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            The same tutor that follows you around the app — answers shaped by your level, your mastery, and whatever
            page you were just on.
          </p>
        </div>
        <Badge color="cyan">
          <Sparkles className="h-3 w-3" /> Prototype AI · grounded, never invents quantum facts
        </Badge>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-2.5 border-qx-cyan/20 bg-qx-cyan/[0.06] p-4">
        <Command className="h-4 w-4 shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-ink-2">
          This is one continuous conversation. Open the tutor anywhere with{" "}
          <span className="font-semibold text-ink">Ask AI Tutor</span> (or{" "}
          <kbd className="rounded border border-line bg-card2 px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>{" "}
          <kbd className="rounded border border-line bg-card2 px-1.5 py-0.5 font-mono text-[10px]">I</kbd>) and
          your thread is still here — with the page you're on folded in as context.
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <Card className="flex h-[64vh] flex-col overflow-hidden">
          <TutorMessageList
            messages={messages}
            typing={typing}
            onFollowUp={(t) => ask(t)}
            className="flex-1"
          />
          <TutorRephraseRow onRephrase={rephrase} disabled={messages.length === 0} />
          <TutorComposer
            onSend={(t) => ask(t)}
            typing={typing}
            placeholder={`Ask in ${activeMode.label} mode… (e.g. "what does my circuit do?")`}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-1 font-semibold text-ink">Tutor mode</h3>
            <p className="mb-3 text-xs text-ink-2">How should I answer? “{activeMode.hint}”</p>
            <TutorModeChips mode={mode} onSelect={setMode} />
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 font-semibold text-ink">🌐 {t("responseLanguage")}</h3>
            <select
              value={tutorLang}
              onChange={(e) => setTutorLang(e.target.value as typeof tutorLang)}
              aria-label={t("responseLanguage")}
              className="w-full rounded-xl border border-line bg-card2 px-3 py-2 text-sm text-ink focus:border-qx-violet/60 focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.nativeLabel}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-ink-3">
              Defaults to your site language. Technical terms, gates and notation stay in standard form.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-ink">
              <CircuitBoard className="h-4 w-4 text-accent" /> What I can see right now
            </h3>
            <ContextChip title={pageContext.title} kind={pageContext.kind} hasCircuit={Boolean(contextCircuit)} />
            {published && published.ops.length === 0 && (
              <p className="mt-2 text-[11px] text-ink-3">
                The builder you came from is open but empty — the tutor will say so rather than invent a circuit.
              </p>
            )}
            <p className="mt-2.5 text-xs leading-relaxed text-ink-2">
              {contextCircuit
                ? `The circuit live on the page you came from — ${contextCircuit.ops.length} gate${contextCircuit.ops.length === 1 ? "" : "s"} across ${contextCircuit.numQubits} qubit${contextCircuit.numQubits === 1 ? "" : "s"}.`
                : latestCircuit
                  ? `No live circuit on screen, so I'm reading your latest saved experiment “${latestCircuit.name}” (${latestCircuit.ops.length} gates). Build something in the Lab and I'll read the real thing.`
                  : "No circuit yet. Build one in the Lab and ask me to explain it — I read the actual gates and the simulator's actual numbers."}
            </p>
            {contextCircuit ? (
              <button
                onClick={() => ask("Explain my circuit", "explain")}
                disabled={typing}
                className="mt-3 w-full rounded-xl border border-qx-cyan/30 bg-qx-cyan/10 px-3 py-2 text-sm font-medium text-accent transition hover:bg-qx-cyan/20"
              >
                Explain the circuit on my page
              </button>
            ) : latestCircuit ? (
              <button
                onClick={() => ask("What does my circuit do?", "explain")}
                disabled={typing}
                className="mt-3 w-full rounded-xl border border-qx-cyan/30 bg-qx-cyan/10 px-3 py-2 text-sm font-medium text-accent transition hover:bg-qx-cyan/20"
              >
                What does my circuit do?
              </button>
            ) : (
              <Link to="/lab" className="mt-3 inline-block text-sm text-accent hover:underline">
                Open the Quantum Lab →
              </Link>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-semibold text-ink">Try asking</h3>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  disabled={typing}
                  className="rounded-xl border border-line bg-card2/50 px-3.5 py-2.5 text-left text-sm text-ink-2 transition hover:border-qx-violet/40 hover:bg-qx-violet/10 hover:text-ink"
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-qx-violet" /> Your profile
            </h3>
            <p className="text-xs text-ink-2">
              {currentUser
                ? `Level ${currentUser.level} · mode ${learningMode}${learningProfile?.learningGoal ? ` · goal: ${learningProfile.learningGoal.replace(/-/g, " ")}` : ""}`
                : "Log in and the tutor will adapt to your level and mastery."}
            </p>
            {topicMasteryList.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {[...topicMasteryList]
                  .sort((a, b) => b.mastery - a.mastery)
                  .slice(0, 4)
                  .map((m) => (
                    <div key={m.topicId} className="flex items-center justify-between text-xs">
                      <span className="text-ink-2">{topicName(m.topicId)}</span>
                      <span className="font-mono text-ink-2">{m.mastery}%</span>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          <Card className="border-qx-amber/20 bg-qx-amber/5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-qx-amber">How this works</h3>
            <p className="text-xs leading-relaxed text-ink-2">
              Answers come from a curated, verified knowledge base plus your own learning data. For questions about your
              circuit, the tutor reads the real circuit and the simulator's real numbers — it never guesses. A production
              LLM could be dropped in behind the same interface (see <span className="font-mono">aiService.ts</span>).
              {askCount > 0 && " Thanks for asking — Curious Mind unlocked! 🏅"}
            </p>
          </Card>

          <button
            onClick={clear}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card2/50 px-4 py-2.5 text-sm text-ink-2 transition hover:border-rose-500/30 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" /> Clear this conversation
          </button>
        </div>
      </div>
    </div>
  );
}
