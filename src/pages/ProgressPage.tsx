import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Award, Flame, LineChart as LineChartIcon, Target, TrendingUp, Zap } from "lucide-react";
import { ProgressBar, StatCard } from "../components/ui";
import { ACHIEVEMENTS, LESSONS, lessonById } from "../data/content";
import { overallProgress, useStore } from "../lib/store";

const SKILLS = [
  { name: "Classical vs Quantum", lessons: ["l1"] },
  { name: "Qubits", lessons: ["l2"] },
  { name: "Superposition", lessons: ["l3"] },
  { name: "Measurement", lessons: ["l4"] },
  { name: "Quantum Gates", lessons: ["l5"] },
  { name: "Quantum Circuits", lessons: ["l6"] },
  { name: "Entanglement", lessons: ["l7"] },
  { name: "Algorithms", lessons: ["l8"] },
  { name: "Cryptography", lessons: ["l9"] },
  { name: "Applications", lessons: ["l10"] },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#0e1526",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  fontSize: 12,
};

export default function ProgressPage() {
  const { currentUser, db, completedLessonIds, totalXp, level, streakDays, bestStreak } = useStore();
  if (!currentUser) return null;
  const uid = currentUser.id;

  const attempts = db.quizAttempts.filter((a) => a.userId === uid).sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const achievements = db.userAchievements.filter((a) => a.userId === uid);

  const xpTimeline = useMemo(() => {
    const byDay = new Map<string, number>();
    const add = (iso: string, xp: number) => {
      if (!xp) return;
      const day = iso.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + xp);
    };
    for (const a of attempts) add(a.completedAt, a.xpEarned);
    for (const a of achievements) {
      const def = ACHIEVEMENTS.find((x) => x.id === a.achievementId);
      add(a.earnedAt, def?.xp ?? 0);
    }
    for (const p of db.lessonProgress) {
      if (p.userId === uid && p.status === "completed") {
        const l = lessonById(p.lessonId);
        add(p.lastActivityAt, l?.xp ?? 0);
      }
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, xp]) => ({ day: day.slice(5).replace("-", "/"), xp }));
  }, [attempts, achievements, db.lessonProgress, uid]);

  const avgScore = attempts.length
    ? Math.round((attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length))
    : null;

  const completionPct = overallProgress(completedLessonIds);

  const skillData = SKILLS.map((s) => {
    const lessons = s.lessons.map(lessonById).filter(Boolean);
    const pct = lessons.length
      ? Math.round((lessons.filter((l) => completedLessonIds.includes(l!.id)).length / lessons.length) * 100)
      : 0;
    return { name: s.name, pct };
  });

  const quizChart = attempts.map((a, i) => ({
    name: `Quiz ${i + 1}`,
    score: Math.round((a.score / a.total) * 100),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <LineChartIcon className="h-6 w-6 text-qx-cyan" /> Your Progress
          </h1>
          <p className="mt-1 text-sm text-slate-400">Every lesson, quiz, and experiment — tracked.</p>
        </div>
        <Link to="/learn" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
          Keep learning →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={<Target className="h-5 w-5" />} label="Overall" value={`${completionPct}%`} sub="course completion" accent="violet" />
        <StatCard icon={<Zap className="h-5 w-5" />} label="XP points" value={totalXp} sub={`Level ${level}`} accent="amber" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${streakDays}d`} sub={`best ${bestStreak}d`} accent="rose" />
        <StatCard icon={<Award className="h-5 w-5" />} label="Achievements" value={achievements.length} sub={`of ${ACHIEVEMENTS.length}`} accent="mint" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Avg quiz" value={avgScore !== null ? `${avgScore}%` : "—"} sub={`${attempts.length} quizzes`} accent="cyan" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* XP timeline */}
        <div className="rounded-2xl border border-white/10 bg-ink-850/80 p-5">
          <h2 className="mb-1 font-semibold text-white">XP earned over time</h2>
          <p className="mb-4 text-xs text-slate-500">XP from lessons, quizzes, and achievements</p>
          {xpTimeline.length === 0 ? (
            <EmptyChart text="Complete a lesson or quiz to see your XP curve." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={xpTimeline} margin={{ left: -20, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#c4b5fd" }} />
                <Area type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#xpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* quiz performance */}
        <div className="rounded-2xl border border-white/10 bg-ink-850/80 p-5">
          <h2 className="mb-1 font-semibold text-white">Quiz performance</h2>
          <p className="mb-4 text-xs text-slate-500">Score per quiz attempt (%)</p>
          {quizChart.length === 0 ? (
            <EmptyChart text="Take a quiz after a lesson to see your scores." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quizChart} margin={{ left: -20, right: 6, top: 6 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#67e8f9" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {quizChart.map((_, i) => (
                    <Cell key={i} fill={quizChart[i].score >= 80 ? "#34d399" : quizChart[i].score >= 50 ? "#22d3ee" : "#fb7185"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* skill map */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-850/80 p-5">
        <h2 className="mb-1 font-semibold text-white">Concept mastery</h2>
        <p className="mb-5 text-xs text-slate-500">Your skill map across the curriculum</p>
        <div className="space-y-3.5">
          {skillData.map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <span className="w-44 shrink-0 truncate text-sm text-slate-300">{s.name}</span>
              <ProgressBar value={s.pct} className="flex-1" />
              <span className="w-12 shrink-0 text-right font-mono text-xs text-slate-400">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
      {text}
    </div>
  );
}