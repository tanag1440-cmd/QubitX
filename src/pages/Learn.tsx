import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Binary, Brain, CheckCircle2, CircleDot, Clock, Cpu, Eye,
  GitBranch, Link2, Lock, PlayCircle, Rocket, Waves, Zap,
} from "lucide-react";
import { Badge, Card, ProgressBar, SectionHeading } from "../components/ui";
import { LESSONS, MODULES } from "../data/content";
import { nextLesson, useStore } from "../lib/store";

const ICONS: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-5 w-5" />, CircleDot: <CircleDot className="h-5 w-5" />, Waves: <Waves className="h-5 w-5" />,
  Eye: <Eye className="h-5 w-5" />, Binary: <Binary className="h-5 w-5" />, GitBranch: <GitBranch className="h-5 w-5" />,
  Link2: <Link2 className="h-5 w-5" />, Brain: <Brain className="h-5 w-5" />, Lock: <Lock className="h-5 w-5" />, Rocket: <Rocket className="h-5 w-5" />,
};

export default function Learn() {
  const { completedLessonIds, db, currentUser } = useStore();
  const navigate = useNavigate();
  const next = nextLesson(completedLessonIds);
  const userId = currentUser?.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Curriculum"
        title="Learn Quantum Computing, Step by Step"
        sub="Ten guided modules. Each one mixes plain-language explanations with hands-on interactive demos and a quiz."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {MODULES.map((m, i) => {
          const lesson = LESSONS.find((l) => l.moduleId === m.id);
          if (!lesson) return null;
          const completed = completedLessonIds.includes(lesson.id);
          const isNext = next?.lessonId === lesson.id;
          const locked = !completed && !isNext;
          const progress = userId
            ? db.lessonProgress.find((p) => p.userId === userId && p.lessonId === lesson.id)?.progress ?? 0
            : 0;

          return (
            <Card
              key={m.id}
              className={`group relative overflow-hidden p-6 transition ${
                locked ? "opacity-75" : "hover:border-qx-violet/40 hover:shadow-glow"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    completed ? "bg-qx-mint/15 text-qx-mint" : locked ? "bg-white/5 text-slate-600" : "bg-qx-violet/15 text-qx-violet"
                  }`}
                >
                  {locked ? <Lock className="h-5 w-5" /> : ICONS[m.icon] ?? <CircleDot className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">Module {m.order}</span>
                    {completed && <Badge color="mint"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>}
                    {isNext && <Badge color="violet">Up next</Badge>}
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-white">{m.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-400">{m.short}</p>
                </div>
                <span className="hidden shrink-0 items-center gap-1 font-mono text-xs text-slate-500 sm:flex">
                  <Zap className="h-3.5 w-3.5 text-qx-amber" /> {m.xp} XP
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={completed ? 100 : progress} className="flex-1" />
                <span className="font-mono text-xs text-slate-500">{completed ? "100%" : `${progress}%`}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> {m.duration} · {lesson.quiz.length} question quiz
                </span>
                {locked ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Lock className="h-3.5 w-3.5" /> Complete previous module
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(`/learn/${lesson.id}`)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-qx-cyan hover:underline"
                  >
                    {completed ? "Review" : progress > 0 ? "Continue" : "Start lesson"} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-slate-400">
          Lessons unlock in order — but if you already know the basics, jump straight into the{" "}
          <Link to="/lab" className="font-semibold text-qx-cyan hover:underline">Quantum Lab</Link> or{" "}
          <Link to="/algorithms" className="font-semibold text-qx-cyan hover:underline">Algorithm Explorer</Link>.
        </p>
      </div>
    </div>
  );
}