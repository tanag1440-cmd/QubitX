import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Binary, BookOpen, CheckCircle2, ClipboardCheck, FlaskConical, Lock, Play, RefreshCw,
  Sparkles, Swords, Target, Waves,
} from "lucide-react";
import { Badge, Button, Card, LinkButton, ProgressBar, SectionHeading, StatCard } from "../components/ui";
import { GroundedChip, MasteryBar } from "../components/learning";
import { GOAL_LABELS, TOPICS, topicById, topicName } from "../data/learningTopics";
import { activeMistakes, masteryMap, masteryBand, overallMastery } from "../lib/learning/engine";
import { useStore } from "../lib/store";
import type { LearningGoal, LearningMode, TopicDef } from "../types";

const MODES: { id: LearningMode; label: string; body: string }[] = [
  { id: "guided", label: "Guided", body: "Maximum explanations and hints." },
  { id: "practice", label: "Practice", body: "Normal adaptive challenges." },
  { id: "challenge", label: "Challenge", body: "Fewer hints, harder questions." },
  { id: "exam", label: "Exam", body: "Timed, no hints during the attempt." },
  { id: "experiment", label: "Experiment", body: "Free circuit exploration." },
];

type Status = "mastered" | "focus" | "available" | "locked";

export default function LearningPath() {
  const {
    currentUser, topicMasteryList, mistakePatterns, learningProfile, suggestedNext,
    overallMasteryValue, learningMode, setLearningGoal, setLearningMode, diagnostic,
  } = useStore();

  const mastery = useMemo(() => masteryMap(topicMasteryList), [topicMasteryList]);
  const focusTopicId = suggestedNext[0]?.topicId ?? null;
  const focusRec = suggestedNext[0] ?? null;
  const active = useMemo(() => activeMistakes(mistakePatterns), [mistakePatterns]);

  const statusOf = (t: TopicDef): Status => {
    const m = mastery.get(t.id);
    if ((m?.mastery ?? 0) >= 80 && (m?.attempts ?? 0) > 0) return "mastered";
    if (t.id === focusTopicId) return "focus";
    const ready = t.prerequisites.every((p) => (mastery.get(p)?.mastery ?? 0) >= 55);
    return ready ? "available" : "locked";
  };

  const ordered = useMemo(() => {
    // TOPICS is authored in prerequisite order; keep that, but surface the focus
    // topic immediately after the last mastered block for a natural flow.
    return TOPICS;
  }, []);

  const masteredCount = ordered.filter((t) => statusOf(t) === "mastered").length;
  const readyCount = ordered.filter((t) => statusOf(t) === "available").length;
  const lockedCount = ordered.filter((t) => statusOf(t) === "locked").length;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Target className="mx-auto mb-4 h-12 w-12 text-qx-violet" />
        <h1 className="text-2xl font-bold text-white">My Learning Path</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Qubit-X builds a personal roadmap from your actual performance — what to learn next, what to revise,
          and what you can safely skip. Log in to see yours.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton to="/login">Log in</LinkButton>
          <LinkButton to="/signup" variant="secondary">Create account</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Adaptive"
        title="My Learning Path"
        sub="Regenerated from your mastery, prerequisites, misconceptions and goal every time you practise. Nobody gets the same path."
      />

      {!diagnostic && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-qx-cyan/30 bg-qx-cyan/[0.06] p-5">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-5 w-5 text-qx-cyan" />
            <div>
              <p className="text-sm font-semibold text-white">Take the 3-minute diagnostic</p>
              <p className="mt-1 text-sm text-slate-400">It sharpens your starting point so the path isn't guesswork.</p>
            </div>
          </div>
          <LinkButton to="/diagnostic" size="sm">Run diagnostic <ArrowRight className="h-4 w-4" /></LinkButton>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Overall mastery" value={`${overallMasteryValue}%`} sub={`${masteredCount} of ${ordered.length} topics mastered`} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Ready to learn" value={readyCount} sub="Prerequisites satisfied" accent="cyan" />
        <StatCard icon={<RefreshCw className="h-5 w-5" />} label="Needs revision" value={active.length} sub="Recurring misconceptions" accent="amber" />
        <StatCard icon={<Lock className="h-5 w-5" />} label="Locked" value={lockedCount} sub="Prerequisites pending" accent="rose" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {ordered.map((t) => {
            const status = statusOf(t);
            const m = mastery.get(t.id);
            const score = m?.mastery ?? 0;
            const topicMistakes = active.filter((x) => x.topicId === t.id);
            return (
              <Card
                key={t.id}
                className={`p-4 ${status === "focus" ? "border-qx-violet/50 shadow-glow" : status === "locked" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    status === "mastered" ? "bg-qx-mint/15 text-qx-mint"
                      : status === "focus" ? "bg-qx-violet/20 text-qx-violet"
                      : status === "locked" ? "bg-white/5 text-slate-500"
                      : "bg-white/8 text-slate-300"
                  }`}>
                    {status === "mastered" ? <CheckCircle2 className="h-4 w-4" /> : status === "locked" ? <Lock className="h-3.5 w-3.5" /> : t.category === "Gates" ? <Binary className="h-4 w-4" /> : t.category === "Algorithms" ? <Sparkles className="h-4 w-4" /> : <Waves className="h-4 w-4" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{t.name}</p>
                      {status === "mastered" && <Badge color="mint">Mastered · can skip</Badge>}
                      {status === "focus" && <Badge color="violet">Current focus</Badge>}
                      {status === "locked" && (
                        <Badge color="slate">Needs {t.prerequisites.filter((p) => (mastery.get(p)?.mastery ?? 0) < 55).map((p) => topicName(p)).join(", ")}</Badge>
                      )}
                      {topicMistakes.length > 0 && <Badge color="amber"><RefreshCw className="h-3 w-3" /> Revision</Badge>}
                      <Badge color="slate">{t.category}</Badge>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">{t.blurb}</p>

                    {m && m.attempts > 0 && (
                      <div className="mt-3 max-w-sm">
                        <MasteryBar topicId={t.id} mastery={score} attempts={m.attempts} confidence={m.confidence} compact />
                      </div>
                    )}

                    {topicMistakes.length > 0 && (
                      <p className="mt-2 text-xs text-qx-amber">
                        {topicMistakes[0].label} · seen {topicMistakes[0].frequency}×
                      </p>
                    )}

                    {status === "focus" && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {t.lessonId && (
                          <Link to={`/learn/${t.lessonId}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.07]">
                            <BookOpen className="h-4 w-4 text-qx-violet" /> Concept + lesson
                          </Link>
                        )}
                        {t.demoId && (
                          <Link to="/visualize" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.07]">
                            <Play className="h-4 w-4 text-qx-cyan" /> Visualization
                          </Link>
                        )}
                        <Link to="/ai-challenges" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.07]">
                          <FlaskConical className="h-4 w-4 text-qx-mint" /> Guided circuit
                        </Link>
                        <Link to="/ai-challenges" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.07]">
                          <Swords className="h-4 w-4 text-qx-amber" /> Challenge
                        </Link>
                      </div>
                    )}

                    {status === "available" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.lessonId && <LinkButton to={`/learn/${t.lessonId}`} size="sm" variant="secondary">Open lesson</LinkButton>}
                        <LinkButton to="/ai-challenges" size="sm" variant="ghost">Practise challenge</LinkButton>
                      </div>
                    )}

                    {status === "mastered" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <LinkButton to="/ai-challenges" size="sm" variant="ghost">Harder challenge</LinkButton>
                        <LinkButton to="/lab" size="sm" variant="ghost">Experiment in Lab</LinkButton>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-qx-cyan" />
              <p className="text-sm font-semibold text-white">Why this order?</p>
            </div>
            <GroundedChip />
            {focusRec ? (
              <>
                <p className="mt-3 text-sm font-semibold text-white">{focusRec.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{focusRec.reason}</p>
                <LinkButton to="/ai-challenges" size="sm" className="mt-4">Act on it <ArrowRight className="h-4 w-4" /></LinkButton>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-300">Everything you're ready for is mastered. Try an expert-level challenge or explore the Lab.</p>
            )}
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-white">Learning goal</p>
            <p className="mt-1 text-xs text-slate-400">One input to the engine — never the only one.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(GOAL_LABELS) as LearningGoal[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setLearningGoal(g)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    learningProfile?.learningGoal === g
                      ? "border-qx-violet/60 bg-qx-violet/15 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {GOAL_LABELS[g]}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-white">Learning mode</p>
            <p className="mt-1 text-xs text-slate-400">Changes how much help you get and how hard the practice is.</p>
            <div className="mt-3 space-y-2">
              {MODES.map((mo) => (
                <button
                  key={mo.id}
                  onClick={() => setLearningMode(mo.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    learningMode === mo.id ? "border-qx-violet/60 bg-qx-violet/15" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${learningMode === mo.id ? "border-qx-violet bg-qx-violet" : "border-white/25"}`} />
                  <span>
                    <span className="block text-sm font-medium text-white">{mo.label}</span>
                    <span className="block text-xs text-slate-400">{mo.body}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {active.length > 0 && (
            <Card className="p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <RefreshCw className="h-4 w-4 text-qx-amber" /> Mistake memory
              </p>
              <p className="mt-1 text-xs text-slate-400">Recurring misconceptions get targeted practice automatically.</p>
              <ul className="mt-3 space-y-2">
                {active.slice(0, 4).map((mp) => (
                  <li key={mp.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                    <p className="text-sm text-slate-200">{mp.label}</p>
                    <p className="text-xs text-slate-500">{topicName(mp.topicId)} · {mp.frequency}× · {mp.severity} severity</p>
                  </li>
                ))}
              </ul>
              <LinkButton to="/ai-challenges" size="sm" variant="secondary" className="mt-4">Practise these</LinkButton>
            </Card>
          )}

          <Card className="p-6">
            <p className="text-sm font-semibold text-white">Mastery snapshot</p>
            <div className="mt-3 space-y-3">
              {ordered
                .filter((t) => (mastery.get(t.id)?.attempts ?? 0) > 0)
                .sort((a, b) => (mastery.get(b.id)?.mastery ?? 0) - (mastery.get(a.id)?.mastery ?? 0))
                .slice(0, 6)
                .map((t) => {
                  const m = mastery.get(t.id)!;
                  return <MasteryBar key={t.id} topicId={t.id} mastery={m.mastery} attempts={m.attempts} compact />;
                })}
            </div>
            {overallMastery(topicMasteryList) === 0 && (
              <p className="mt-3 text-xs text-slate-500">No evidence yet — take the diagnostic or complete a lesson to start the profile.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
