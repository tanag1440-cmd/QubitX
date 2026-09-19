import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Calendar, Check, Flame, LogOut, Mail, Pencil, Zap } from "lucide-react";
import { Avatar } from "../components/layout/Avatar";
import { Ket } from "../components/quantum/display";
import { Badge, Button, Card, ProgressBar } from "../components/ui";
import { ACHIEVEMENTS, LESSONS } from "../data/content";
import { levelFromXp, overallProgress, useStore } from "../lib/store";
import { LANGUAGES, useI18n } from "../lib/i18n";
import type { Language, Level } from "../types";

const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced"];

export default function Profile() {
  const { currentUser, db, logout, updateProfile, completedLessonIds, totalXp } = useStore();
  const { language, setLanguage, languages } = useI18n();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [level, setLevel] = useState<Level>(currentUser?.level ?? "Beginner");
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;
  const uid = currentUser.id;
  const earned = db.userAchievements.filter((a) => a.userId === uid);
  const attempts = db.quizAttempts.filter((a) => a.userId === uid);
  const experiments = db.experiments.filter((e) => e.userId === uid);
  const completion = overallProgress(completedLessonIds);

  const save = () => {
    updateProfile(name, level);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Profile</h1>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* identity card */}
        <Card className="h-fit p-6">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size={64} />
            <div>
              <p className="text-lg font-bold text-ink">{currentUser.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-ink-2">
                <Mail className="h-3.5 w-3.5" /> {currentUser.email}
              </p>
            </div>
          </div>

          {editing ? (
            <div className="mt-5 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-ink-2">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-card2 px-3 py-2 text-sm text-ink focus:border-qx-violet/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink-2">Learning level</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="w-full rounded-xl border border-line bg-card2 px-3 py-2 text-sm text-ink focus:border-qx-violet/60 focus:outline-none"
                >
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink-2">🌐 Preferred language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full rounded-xl border border-line bg-card2 px-3 py-2 text-sm text-ink focus:border-qx-violet/60 focus:outline-none"
                >
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.nativeLabel}</option>)}
                </select>
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={save}><Check className="h-4 w-4" /> {saved ? "Saved!" : "Save"}</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-5 flex items-center gap-3">
                <Badge color={currentUser.level === "Beginner" ? "mint" : currentUser.level === "Intermediate" ? "amber" : "rose"}>
                  {currentUser.level}
                </Badge>
                <Badge color="slate">🌐 {languages.find((l) => l.code === language)?.nativeLabel ?? language}</Badge>
                <Badge color="slate"><Calendar className="h-3 w-3" /> Joined {new Date(currentUser.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Badge>
                <button onClick={() => { setName(currentUser.name); setLevel(currentUser.level); setEditing(true); }} className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
              <div className="mt-6 rounded-xl border border-line bg-card2/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-2">Learning level</span>
                  <span className="font-mono font-bold text-qx-violet">Level {levelFromXp(totalXp)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={((totalXp % 150) / 150) * 100} className="flex-1" />
                  <span className="font-mono text-xs text-ink-3">{totalXp} XP</span>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat value={completion} label="%" title="Course done" />
            <MiniStat value={db.lessonProgress.filter((p) => p.userId === uid && p.status === "completed").length} label="/10" title="Lessons" />
            <MiniStat value={experiments.length} label="" title="Experiments" />
          </div>
        </Card>

        {/* activity */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-ink">Stats at a glance</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <BigStat icon={<Zap className="h-5 w-5 text-qx-amber" />} value={`${totalXp}`} label="Total XP" />
              <BigStat icon={<Flame className="h-5 w-5 text-qx-rose" />} value={`${db.streak.current}d`} label="Current streak" />
              <BigStat icon={<Award className="h-5 w-5 text-qx-mint" />} value={`${earned.length}/${ACHIEVEMENTS.length}`} label="Achievements" />
              <BigStat icon={<Check className="h-5 w-5 text-accent" />} value={attempts.length} label="Quizzes taken" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-ink">Recent quiz attempts</h2>
            {attempts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line py-6 text-center text-sm text-ink-3">
                No quizzes yet — finish a lesson to take your first quiz.
              </p>
            ) : (
              <div className="space-y-2.5">
                {attempts.slice(-4).reverse().map((a) => {
                  const lesson = LESSONS.find((l) => l.id === a.lessonId);
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-xl border border-line bg-card2/60 px-4 py-3">
                      <span className="truncate text-sm text-ink-2">{lesson?.title ?? "Lesson"}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-28"><ProgressBar value={(a.score / a.total) * 100} /></div>
                        <span className="font-mono text-sm font-bold text-ink">{a.score}/{a.total}</span>
                        <span className="font-mono text-xs text-qx-amber">+{a.xpEarned} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 font-semibold text-ink">Latest experiments</h2>
            {experiments.length === 0 ? (
              <p className="text-sm text-ink-3">
                Run a circuit in the <Link to="/lab" className="text-accent hover:underline">Quantum Lab</Link> to see it here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {experiments.slice(0, 6).map((e) => (
                  <span key={e.id} className="rounded-lg border border-qx-violet/25 bg-qx-violet/10 px-3 py-1.5 text-xs font-medium text-qx-violet">
                    {e.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 rounded-xl border border-line bg-card2/60 p-3 text-xs text-ink-2">
              Fun fact: {totalXp > 0 ? <>you've earned <span className="font-mono text-qx-amber">{totalXp} XP</span> — that's Level {levelFromXp(totalXp)} energy.</> : "complete lessons to start earning XP!"}{" "}
              <Ket value={0} className="text-qx-violet" /> <Ket value={1} className="text-accent" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ value, label, title }: { value: number | string; label: string; title: string }) {
  return (
    <div className="rounded-xl border border-line bg-card2/50 p-3" title={title}>
      <p className="font-mono text-lg font-bold text-ink">{value}{label}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-3">{title}</p>
    </div>
  );
}

function BigStat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-card2/60 p-4 text-center">
      <div className="mx-auto mb-1.5 flex justify-center">{icon}</div>
      <p className="font-mono text-xl font-bold text-ink">{value}</p>
      <p className="text-[11px] text-ink-3">{label}</p>
    </div>
  );
}