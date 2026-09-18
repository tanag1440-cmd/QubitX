import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award, Binary, BookOpen, Brain, CheckCircle2, ChevronRight, CircleDot, Clock, Compass,
  Cpu, Eye, Flame, GitBranch, Link2, Lock, PlayCircle, Rocket, Sparkles,
  Target, TrendingUp, Waves, Zap,
} from "lucide-react";
import { Avatar } from "../components/layout/Avatar";
import { DemoGuide } from "../components/demo/DemoGuide";
import { Ket } from "../components/quantum/display";
import { Badge, Button, Card, LinkButton, ProgressBar, StatCard } from "../components/ui";
import { GroundedChip, MasteryBar } from "../components/learning";
import { MODULES, moduleById, LESSONS } from "../data/content";
import { nextLesson, overallProgress, useStore } from "../lib/store";
import { MISTAKE_LABELS, learningSummary } from "../lib/learning/engine";
import { useRegisterPageContext } from "../lib/tutorContext";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-4 w-4" />, CircleDot: <CircleDot className="h-4 w-4" />, Waves: <Waves className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />, Binary: <Binary className="h-4 w-4" />, GitBranch: <GitBranch className="h-4 w-4" />,
  Link2: <Link2 className="h-4 w-4" />, Brain: <Brain className="h-4 w-4" />, Lock: <Lock className="h-4 w-4" />, Rocket: <Rocket className="h-4 w-4" />,
};

export default function Dashboard() {
  const {
    currentUser, completedLessonIds, completedCount, totalXp, level, streakDays, db, setLessonProgress,
    topicMasteryList, mistakePatterns, suggestedNext, overallMasteryValue, learningProfile, diagnostic,
  } = useStore();
  const navigate = useNavigate();

  // The dashboard's numbers are already computed here, so publish them verbatim
  // rather than letting the tutor re-derive (or guess) them.
  const tutorSummary = currentUser ? learningSummary(topicMasteryList, currentUser.id, mistakePatterns) : null;
  useRegisterPageContext({
    kind: "dashboard",
    title: "Dashboard",
    circuit: null,
    facts: currentUser
      ? [
          `${currentUser.name} · level ${currentUser.level} · ${totalXp} XP · ${streakDays}-day streak.`,
          `Lessons completed: ${completedCount}/10.`,
          `Overall quantum mastery: ${overallMasteryValue}%.`,
          ...(tutorSummary ? [tutorSummary.strengthsText, tutorSummary.gapsText] : []),
          ...(suggestedNext[0] ? [`The app's current recommendation is “${suggestedNext[0].title}” — ${suggestedNext[0].reason}`] : []),
          ...(tutorSummary && tutorSummary.activeMistakes.length > 0
            ? [`Active misconceptions: ${tutorSummary.activeMistakes.map((m) => MISTAKE_LABELS[m.mistakeType] ?? m.mistakeType).join(", ")}.`]
            : []),
        ]
      : [],
    prompts: ["What should I learn next?", "How am I doing?", "What are my weakest topics?"],
  });

  if (!currentUser) return null;

  const overall = overallProgress(completedLessonIds);
  const isDemo = currentUser.id === "demo-user";
  const next = nextLesson(completedLessonIds);
  const currentLesson = next ? LESSONS.find((l) => l.id === next.lessonId) : null;

  // progress for continue card
  const inProgress = db.lessonProgress.find((p) => p.userId === currentUser.id && p.status === "in_progress");
  const continueLesson = currentLesson ?? null;
  const continuePct = inProgress && inProgress.lessonId === continueLesson?.id
    ? inProgress.progress
    : completedLessonIds.includes(continueLesson?.id ?? "") ? 100 : 0;

  const quizAverage = (() => {
    const attempts = db.quizAttempts.filter((a) => a.userId === currentUser.id);
    if (attempts.length === 0) return null;
    return Math.round((attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100);
  })();

  const startLesson = () => {
    if (!continueLesson) return;
    if (continuePct === 0) setLessonProgress(continueLesson.id, 5);
    navigate(`/learn/${continueLesson.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size={48} />
          <div>
            <h1 className="text-2xl font-bold text-ink">
              Welcome back, <span className="text-accent">{currentUser.name.split(" ")[0]}</span> 👋
            </h1>
            <p className="mt-0.5 text-sm text-ink-3">
              {currentUser.level} level · {completedCount}/10 lessons · {quizAverage !== null ? `${quizAverage}% avg quiz score` : "no quizzes yet"}
            </p>
          </div>
        </div>
        <LinkButton to="/learn" variant="secondary">
          <BookOpen className="h-4 w-4" /> Browse all lessons
        </LinkButton>
      </div>

      {isDemo && (
        <div className="mt-6">
          <DemoGuide />
        </div>
      )}

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />} label="Overall progress" value={`${overall}%`}
          sub={`${completedCount} of 10 modules`} accent="violet"
        />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Level" value={level} sub={`${totalXp} XP total`} accent="amber" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Current streak" value={`${streakDays} day${streakDays === 1 ? "" : "s"}`} sub="Keep it burning 🔥" accent="rose" />
        <StatCard icon={<Award className="h-5 w-5" />} label="Achievements" value={db.userAchievements.filter((a) => a.userId === currentUser.id).length} sub="Badges earned" accent="mint" />
      </div>

      {/* ── Adaptive learning recommendations ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <Sparkles className="h-4.5 w-4.5 text-accent" /> What should I learn next?
            </h2>
            <GroundedChip />
          </div>

          {!diagnostic && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-qx-cyan/25 bg-qx-cyan/[0.06] px-4 py-3">
              <p className="text-sm text-ink-2">Take the 3-minute diagnostic so recommendations aren't guesswork.</p>
              <LinkButton to="/diagnostic" size="sm">Run diagnostic</LinkButton>
            </div>
          )}

          {suggestedNext[0] ? (
            <div className="rounded-2xl border border-qx-cyan/25 bg-qx-cyan/5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="cyan">{suggestedNext[0].recommendationType}</Badge>
                <span className="text-xs uppercase tracking-wider text-ink-3">Recommended next</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">{suggestedNext[0].title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                <span className="font-semibold text-ink-2">Reason: </span>{suggestedNext[0].reason}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <LinkButton to="/ai-challenges" size="sm">Start adapted challenge <ChevronRight className="h-4 w-4" /></LinkButton>
                <LinkButton to="/learning-path" size="sm" variant="secondary">View full path</LinkButton>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-2">
              Complete a lesson, quiz or circuit and I'll recommend the next step here.
            </p>
          )}

          {suggestedNext.length > 1 && (
            <div className="mt-4 space-y-2">
              {suggestedNext.slice(1, 3).map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-xl border border-line bg-card2/50 px-4 py-3">
                  <Compass className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                  <div>
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <p className="text-xs text-ink-3">{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Your learning profile</h2>
          <p className="mt-1 text-xs text-ink-3">
            {learningProfile?.learningGoal
              ? `Goal: ${learningProfile.learningGoal.replace(/-/g, " ")} · mode: ${learningProfile.mode}`
              : "Set a goal and mode to steer the engine."}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-3xl font-bold text-ink">{overallMasteryValue}%</span>
            <div className="flex-1">
              <ProgressBar value={overallMasteryValue} />
              <p className="mt-1 text-xs text-ink-3">overall quantum knowledge</p>
            </div>
          </div>

          {topicMasteryList.filter((m) => m.attempts > 0).length > 0 ? (
            <div className="mt-4 space-y-3">
              {[...topicMasteryList]
                .filter((m) => m.attempts > 0)
                .sort((a, b) => b.mastery - a.mastery)
                .slice(0, 4)
                .map((m) => (
                  <MasteryBar key={m.topicId} topicId={m.topicId} mastery={m.mastery} attempts={m.attempts} compact />
                ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-2">No topic evidence yet.</p>
          )}

          {mistakePatterns.length > 0 && (
            <p className="mt-4 rounded-lg border border-qx-amber/25 bg-qx-amber/[0.06] px-3 py-2 text-xs text-qx-amber">
              Tracking {mistakePatterns.length} recurring misconception{mistakePatterns.length === 1 ? "" : "s"} — targeted practice is queued.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton to="/learning-path" size="sm" variant="secondary">My Learning Path</LinkButton>
            <LinkButton to="/progress" size="sm" variant="ghost">Full analytics</LinkButton>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* continue learning */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <PlayCircle className="h-4.5 w-4.5 text-accent" /> Continue Learning
            </h2>
            <Badge color="violet">Next up</Badge>
          </div>
          {continueLesson ? (
            <div className="rounded-2xl border border-qx-violet/25 bg-accent-soft p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-3">
                    Module {moduleById(continueLesson.moduleId)?.order} · {moduleById(continueLesson.moduleId)?.title}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-ink">{continueLesson.title}</h3>
                  <p className="mt-1 text-sm text-ink-2">{continueLesson.summary}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-lg bg-card2 px-2.5 py-1 font-mono text-xs text-ink-2">
                  <Clock className="h-3.5 w-3.5" /> {continueLesson.duration}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={continuePct} className="flex-1" />
                <span className="font-mono text-xs text-ink-2">{continuePct}%</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={startLesson}>
                  {continuePct > 0 && continuePct < 100 ? "Continue lesson" : "Start lesson"} <ChevronRight className="h-4 w-4" />
                </Button>
                <LinkButton to="/lab" variant="secondary">Quantum Lab</LinkButton>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 font-semibold text-ink">You've completed every lesson!</p>
              <p className="mt-1 text-sm text-ink-2">Visit the Quantum Lab or try today's challenge.</p>
              <div className="mt-4 flex justify-center gap-2">
                <LinkButton to="/lab">Quantum Lab</LinkButton>
                <LinkButton to="/challenges" variant="secondary">Challenges</LinkButton>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <QuickLink icon={<Sparkles className="h-4 w-4 text-qx-violet" />} title="Visualize a concept" sub="Superposition, entanglement & more" to="/visualize" />
            <QuickLink icon={<Compass className="h-4 w-4 text-accent" />} title="Explore algorithms" sub="Grover, teleportation, BB84" to="/algorithms" />
          </div>
        </Card>

        {/* roadmap */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <TrendingUp className="h-4.5 w-4.5 text-qx-mint" /> Your Quantum Journey
            </h2>
            <span className="font-mono text-xs text-ink-3">{completedCount}/10</span>
          </div>
          <div className="relative space-y-1.5">
            {MODULES.map((m, i) => {
              const lesson = LESSONS.find((l) => l.moduleId === m.id);
              const completed = lesson ? completedLessonIds.includes(lesson.id) : false;
              const isNext = next?.lessonId === lesson?.id;
              const locked = !completed && !isNext;
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    completed
                      ? "border-qx-mint/25 bg-qx-mint/5"
                      : isNext
                        ? "border-qx-violet/40 bg-qx-violet/10"
                        : "border-line-strong/8 bg-card2/50 opacity-70"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${completed ? "bg-qx-mint/15 text-qx-mint" : isNext ? "bg-qx-violet/20 text-qx-violet" : "bg-card2 text-ink-3"}`}>
                    {locked ? <Lock className="h-4 w-4" /> : completed ? <CheckCircle2 className="h-4.5 w-4.5" /> : (MODULE_ICONS[m.icon] ?? <CircleDot className="h-4 w-4" />)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${locked ? "text-ink-3" : "text-ink"}`}>
                      {i + 1}. {m.title}
                    </p>
                    <p className="text-xs text-ink-3">{m.short} · {m.duration}</p>
                  </div>
                  {completed ? (
                    <Badge color="mint">Done</Badge>
                  ) : locked ? (
                    <Badge color="slate"><Lock className="h-3 w-3" /> Prerequisite</Badge>
                  ) : (
                    <button
                      onClick={() => lesson && navigate(`/learn/${lesson.id}`)}
                      className="rounded-lg bg-qx-violet/20 px-3 py-1.5 text-xs font-bold text-qx-violet hover:bg-qx-violet/30"
                    >
                      Start
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* quick strip: latest experiment / demo ket tip */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Today's idea</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            A qubit in superposition isn't "unknown" — it's <em>both</em>. <Ket value={0} /> and <Ket value={1} /> coexist
            until measurement.
          </p>
          <Link to="/learn/l3" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">Review superposition →</Link>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Daily challenge</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Earn XP by building today's circuit in the lab. Circuits are checked automatically.
          </p>
          <Link to="/challenges" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">Open challenges →</Link>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Stuck on a concept?</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Qubit Tutor explains anything in plain language, with analogies on request.
          </p>
          <Link to="/tutor" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">Ask the tutor →</Link>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ icon, title, sub, to }: { icon: React.ReactNode; title: string; sub: string; to: string }) {
  return (
    <Link to={to} className="group rounded-xl border border-line bg-card2/50 p-4 transition hover:border-qx-violet/40 hover:bg-card2/60">
      <div className="flex items-center gap-2.5">
        {icon}
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-1 text-xs text-ink-3">{sub}</p>
    </Link>
  );
}