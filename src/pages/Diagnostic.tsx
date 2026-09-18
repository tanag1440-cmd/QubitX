import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, ClipboardCheck, Compass, RotateCcw, Sparkles, Target,
} from "lucide-react";
import { Badge, Button, Card, LinkButton, ProgressBar, SectionHeading } from "../components/ui";
import { FeedbackBanner, GroundedChip, CircuitStatic } from "../components/learning";
import { GOAL_LABELS, DIAGNOSTIC, topicName } from "../data/learningTopics";
import { topicById } from "../data/learningTopics";
import { masteryBand } from "../lib/learning/engine";
import { useStore } from "../lib/store";
import { useRegisterPageContext } from "../lib/tutorContext";
import type { LearningGoal } from "../types";

const GOALS: LearningGoal[] = ["from-scratch", "build-circuits", "exam-prep", "algorithms", "machine-learning", "programming", "research"];

export default function Diagnostic() {
  const { currentUser, diagnostic, saveDiagnostic } = useStore();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "quiz" | "result">(diagnostic ? "result" : "intro");
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(DIAGNOSTIC.length).fill(-1));
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [result, setResult] = useState<ReturnType<typeof saveDiagnostic>>(null);

  const q = DIAGNOSTIC[index];
  const answeredCount = answers.filter((a) => a >= 0).length;

  const start = () => {
    setAnswers(new Array(DIAGNOSTIC.length).fill(-1));
    setIndex(0);
    setStartedAt(Date.now());
    setStage("quiz");
  };

  const choose = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
  };

  const finish = () => {
    const scored = saveDiagnostic(answers, goal);
    setResult(scored);
    setStage("result");
  };

  // A recommendation is available fresh from a run, or derived from the stored
  // diagnostic so the panel is never empty on a return visit.
  const storedRecommendation = useMemo(() => {
    if (!diagnostic || diagnostic.topicScores.length === 0) return null;
    const measured = diagnostic.topicScores
      .map((t) => ({ topicId: t.topicId, pct: t.total ? t.correct / t.total : 0 }))
      .sort((a, b) => a.pct - b.pct);
    const weakest = measured.filter((m) => m.pct < 0.6);
    const focus = (weakest[0] ?? measured[measured.length - 1]).topicId;
    const strongest = measured.filter((m) => m.pct >= 0.75).slice(0, 2).map((m) => topicName(m.topicId));
    const text = weakest.length
      ? `You already have a good grasp of ${strongest.join(" and ") || "the basics"}. Your biggest gap is ${topicName(focus)} (${Math.round((weakest[0]?.pct ?? 0) * 100)}% correct), so we'll strengthen that before moving on to harder material.`
      : `You scored ${diagnostic.overallScore}% overall — strong across the board. Your path will skip ahead to more challenging work.`;
    return { topicId: focus, text };
  }, [diagnostic]);

  const recommendation = result?.recommendation ?? storedRecommendation;
  const summary = result?.result.summary ?? diagnostic?.summary ?? "";
  const overall = result?.result.overallScore ?? diagnostic?.overallScore ?? 0;

  // Topic breakdown for the result view (from the fresh result or the stored one).
  const topicRows = useMemo(() => {
    const scores = result?.result.topicScores ?? diagnostic?.topicScores ?? [];
    return scores
      .map((t) => ({ topicId: t.topicId, pct: Math.round((t.correct / t.total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [result, diagnostic]);

  // The diagnostic is an *assessment*, so the copilot helps with the wording and
  // the concept behind a question — never with the answer.
  useRegisterPageContext({
    kind: "diagnostic",
    title: "Quantum Knowledge Diagnostic",
    circuit: null,
    facts:
      stage === "quiz" && q
        ? [
            `The learner is on diagnostic question ${index + 1} of ${DIAGNOSTIC.length} (topic: ${topicName(q.topicId)}).`,
            `The question on screen is: “${q.prompt}” (${q.kind}).`,
            `Options shown: ${q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(" | ")}`,
            "This is a graded diagnostic — do not reveal which option is correct; help them understand the concept instead.",
          ]
        : diagnostic
          ? [`They have already completed the diagnostic with an overall score of ${diagnostic.overallScore}%.`]
          : ["They haven't taken the diagnostic yet."],
    prompts:
      stage === "quiz"
        ? ["What is this question asking?", "Explain the concept behind this question", "I don't understand this question"]
        : ["What does the diagnostic measure?", "What does my diagnostic result mean?", "Why is entanglement important?"],
    focus: stage === "quiz" && q ? { question: q.prompt } : undefined,
  });

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-qx-violet" />
        <h1 className="text-2xl font-bold text-ink">Quantum Knowledge Diagnostic</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-2">
          A short 13-question check that maps your strengths and gaps across quantum topics — so your
          learning path is built for you, not for everyone.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/login")}>Log in</Button>
          <Button variant="secondary" onClick={() => navigate("/signup")}>Create account</Button>
        </div>
      </div>
    );
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <SectionHeading
          eyebrow="Adaptive learning"
          title="Quantum Knowledge Diagnostic"
          sub="This is optional — you can skip straight to learning. But it takes about three minutes and it's how Qubit-X learns where to start you."
        />
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <ClipboardCheck className="h-5 w-5" />, title: "13 mixed questions", body: "Concept, prediction, probability, gate-ID and circuit reading." },
              { icon: <Target className="h-5 w-5" />, title: "Topic-level results", body: "Not just beginner/advanced — see strengths per topic." },
              { icon: <Compass className="h-5 w-5" />, title: "A path built for you", body: "Your roadmap adapts to what you already know." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-line bg-card2/50 p-4">
                <span className="mb-2 inline-flex rounded-lg bg-qx-violet/15 p-2 text-qx-violet">{f.icon}</span>
                <p className="text-sm font-semibold text-ink">{f.title}</p>
                <p className="mt-1 text-xs text-ink-2">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-ink">What's your goal?</p>
            <p className="mb-3 text-xs text-ink-2">This shapes your recommendations — it's one signal among several, and you can change it anytime.</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    goal === g ? "border-qx-violet/60 bg-qx-violet/15 text-ink" : "border-line bg-card2 text-ink-2 hover:bg-card2"
                  }`}
                >
                  {GOAL_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={start} size="lg">Start diagnostic <ArrowRight className="h-4 w-4" /></Button>
            <LinkButton to="/learn" variant="ghost" size="lg">Skip for now</LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (stage === "quiz") {
    const chosen = answers[index];
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-ink-2">
            <span>Question {index + 1} of {DIAGNOSTIC.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <ProgressBar value={((index + 1) / DIAGNOSTIC.length) * 100} />
        </div>

        <Card className="p-6">
          <Badge color="violet">{topicName(q.topicId)}</Badge>
          <h2 className="mt-3 text-lg font-semibold text-ink">{q.prompt}</h2>

          {q.circuit && q.numQubits && (
            <div className="mt-4">
              <CircuitStatic ops={q.circuit} numQubits={q.numQubits} title="Circuit" />
            </div>
          )}

          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                  chosen === i
                    ? "border-qx-violet/60 bg-qx-violet/15 text-ink"
                    : "border-line bg-card2/50 text-ink-2 hover:bg-card2/60"
                }`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                  chosen === i ? "bg-qx-violet text-white" : "bg-card2 text-ink-2"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              Back
            </Button>
            {index < DIAGNOSTIC.length - 1 ? (
              <Button onClick={() => setIndex((i) => i + 1)} disabled={chosen < 0}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={chosen < 0}>
                See my results <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
          {chosen < 0 && <p className="mt-3 text-xs text-ink-3">Pick an answer to continue. Answering "I'm not sure" honestly gives better guidance — there's no penalty.</p>}
        </Card>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  const band = masteryBand(overall, 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SectionHeading eyebrow="Diagnostic result" title="Here's your quantum profile" sub="This is a starting estimate. It sharpens automatically as you learn and build circuits." />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-3">Overall</p>
                <p className="mt-1 text-3xl font-bold text-ink">{overall}%</p>
              </div>
              <Badge color={band.tone}>{band.label}</Badge>
            </div>
            <ProgressBar className="mt-4" value={overall} />
            <p className="mt-4 text-sm leading-relaxed text-ink-2">{summary}</p>
          </Card>

          <Card className="p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-3">Topic breakdown</p>
            <div className="space-y-3">
              {topicRows.map((row) => {
                const t = topicById(row.topicId);
                const tone = row.pct >= 80 ? "mint" : row.pct >= 50 ? "cyan" : "rose";
                return (
                  <div key={row.topicId} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm text-ink-2" title={t?.name}>{t?.name ?? row.topicId}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-card2">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tone === "mint" ? "from-qx-mint to-qx-cyan" : tone === "cyan" ? "from-qx-cyan to-qx-indigo" : "from-qx-rose to-rose-600"}`}
                        style={{ width: `${Math.max(row.pct, 3)}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right font-mono text-sm text-ink">{row.pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {result && (
            <div className="grid gap-3">
              <FeedbackBanner
                correct
                headline="Profile created"
                detail="Your starting point is set. Each lesson, quiz and circuit you complete will update these topic scores automatically."
              />
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-ink">AI recommendation</p>
            </div>
            <GroundedChip />
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              {recommendation?.text ?? "Open your learning path to see where Qubit-X recommends you start."}
            </p>
            {recommendation && (
              <p className="mt-3 text-xs text-ink-3">
                Starting focus: <span className="font-semibold text-ink-2">{topicName(recommendation.topicId)}</span>
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              <LinkButton to="/learning-path" size="sm">
                Open My Learning Path <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/ai-challenges" variant="secondary" size="sm">Start an adapted challenge</LinkButton>
            </div>
          </Card>

          <Card className="p-6">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <RotateCcw className="h-4 w-4" /> Retake
            </p>
            <p className="mb-3 text-xs text-ink-2">
              Retaking re-seeds your starting estimate. Your practice history is kept — mastery never drops just because you retook a quiz.
            </p>
            <Button variant="secondary" size="sm" onClick={() => { setStage("intro"); setResult(null); }}>Retake diagnostic</Button>
          </Card>

          <Card className="p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 text-qx-mint" /> Prefer to explore first?
            </p>
            <p className="mt-1.5 text-xs text-ink-2">
              Everything stays available: lessons, the Quantum Lab, the Visualize demos and the AI Tutor.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link to="/learn" className="text-accent hover:underline">Lessons</Link>
              <span className="text-ink-3">·</span>
              <Link to="/lab" className="text-accent hover:underline">Quantum Lab</Link>
              <span className="text-ink-3">·</span>
              <Link to="/tutor" className="text-accent hover:underline">AI Tutor</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
