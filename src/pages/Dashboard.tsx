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
import { MODULES, moduleById, LESSONS } from "../data/content";
import { nextLesson, overallProgress, useStore } from "../lib/store";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-4 w-4" />, CircleDot: <CircleDot className="h-4 w-4" />, Waves: <Waves className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />, Binary: <Binary className="h-4 w-4" />, GitBranch: <GitBranch className="h-4 w-4" />,
  Link2: <Link2 className="h-4 w-4" />, Brain: <Brain className="h-4 w-4" />, Lock: <Lock className="h-4 w-4" />, Rocket: <Rocket className="h-4 w-4" />,
};

export default function Dashboard() {
  const { currentUser, completedLessonIds, completedCount, totalXp, level, streakDays, db, setLessonProgress } = useStore();
  const navigate = useNavigate();
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
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="bg-gradient-to-r from-qx-violet to-qx-cyan bg-clip-text text-transparent">{currentUser.name.split(" ")[0]}</span> 👋
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* continue learning */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <PlayCircle className="h-4.5 w-4.5 text-qx-cyan" /> Continue Learning
            </h2>
            <Badge color="violet">Next up</Badge>
          </div>
          {continueLesson ? (
            <div className="rounded-2xl border border-qx-violet/25 bg-gradient-to-br from-qx-violet/10 to-transparent p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Module {moduleById(continueLesson.moduleId)?.order} · {moduleById(continueLesson.moduleId)?.title}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">{continueLesson.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{continueLesson.summary}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> {continueLesson.duration}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={continuePct} className="flex-1" />
                <span className="font-mono text-xs text-slate-400">{continuePct}%</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={startLesson}>
                  {continuePct > 0 && continuePct < 100 ? "Continue lesson" : "Start lesson"} <ChevronRight className="h-4 w-4" />
                </Button>
                <LinkButton to="/lab" variant="secondary">Quantum Lab</LinkButton>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 font-semibold text-white">You've completed every lesson!</p>
              <p className="mt-1 text-sm text-slate-400">Visit the Quantum Lab or try today's challenge.</p>
              <div className="mt-4 flex justify-center gap-2">
                <LinkButton to="/lab">Quantum Lab</LinkButton>
                <LinkButton to="/challenges" variant="secondary">Challenges</LinkButton>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <QuickLink icon={<Sparkles className="h-4 w-4 text-qx-violet" />} title="Visualize a concept" sub="Superposition, entanglement & more" to="/visualize" />
            <QuickLink icon={<Compass className="h-4 w-4 text-qx-cyan" />} title="Explore algorithms" sub="Grover, teleportation, BB84" to="/algorithms" />
          </div>
        </Card>

        {/* roadmap */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <TrendingUp className="h-4.5 w-4.5 text-qx-mint" /> Your Quantum Journey
            </h2>
            <span className="font-mono text-xs text-slate-500">{completedCount}/10</span>
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
                        : "border-white/8 bg-white/[0.02] opacity-70"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${completed ? "bg-qx-mint/15 text-qx-mint" : isNext ? "bg-qx-violet/20 text-qx-violet" : "bg-white/5 text-slate-600"}`}>
                    {locked ? <Lock className="h-4 w-4" /> : completed ? <CheckCircle2 className="h-4.5 w-4.5" /> : (MODULE_ICONS[m.icon] ?? <CircleDot className="h-4 w-4" />)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${locked ? "text-slate-500" : "text-white"}`}>
                      {i + 1}. {m.title}
                    </p>
                    <p className="text-xs text-slate-500">{m.short} · {m.duration}</p>
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
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's idea</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            A qubit in superposition isn't "unknown" — it's <em>both</em>. <Ket value={0} /> and <Ket value={1} /> coexist
            until measurement.
          </p>
          <Link to="/learn/l3" className="mt-3 inline-block text-xs font-semibold text-qx-cyan hover:underline">Review superposition →</Link>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Daily challenge</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Earn XP by building today's circuit in the lab. Circuits are checked automatically.
          </p>
          <Link to="/challenges" className="mt-3 inline-block text-xs font-semibold text-qx-cyan hover:underline">Open challenges →</Link>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stuck on a concept?</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Qubit Tutor explains anything in plain language, with analogies on request.
          </p>
          <Link to="/tutor" className="mt-3 inline-block text-xs font-semibold text-qx-cyan hover:underline">Ask the tutor →</Link>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ icon, title, sub, to }: { icon: React.ReactNode; title: string; sub: string; to: string }) {
  return (
    <Link to={to} className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-qx-violet/40 hover:bg-white/[0.06]">
      <div className="flex items-center gap-2.5">
        {icon}
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </Link>
  );
}