import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, BookOpen, BookPlus, GraduationCap, Plus, Shield, Trash2,
  Users, Zap,
} from "lucide-react";
import { Badge, Button, Card, SectionHeading, StatCard } from "../components/ui";
import { ACHIEVEMENTS, LESSONS, RESOURCES, moduleById } from "../data/content";
import { useStore } from "../lib/store";
import type { ResourceItem } from "../types";

const CATEGORIES: ResourceItem["category"][] = ["Beginner", "Mathematics", "Physics", "Programming", "Algorithms", "Research", "Career"];
const TYPES: ResourceItem["type"][] = ["Article", "Video", "Docs", "Book", "Course"];

export default function Admin() {
  const { currentUser, db, addResource, deleteResource, deleteUser } = useStore();
  const [tab, setTab] = useState<"overview" | "users" | "content" | "resources">("overview");
  const [form, setForm] = useState({ title: "", description: "", url: "", type: "Article" as ResourceItem["type"], category: "Beginner" as ResourceItem["category"] });

  if (!currentUser) return null;

  // In this prototype any account can open /admin, so restrict real admin tools
  const isAdmin = currentUser.isAdmin === true;
  const users = db.users;

  const lessonCompletions = (lessonId: string) =>
    db.lessonProgress.filter((p) => p.lessonId === lessonId && p.status === "completed").length;

  const lessonAvgScore = (lessonId: string) => {
    const a = db.quizAttempts.filter((x) => x.lessonId === lessonId);
    if (a.length === 0) return null;
    return Math.round((a.reduce((s, x) => s + (x.score / x.total) * 100, 0) / a.length));
  };

  const stats = [
    { icon: <Users className="h-5 w-5" />, label: "Total users", value: users.length, accent: "violet" as const },
    { icon: <BookOpen className="h-5 w-5" />, label: "Lesson completions", value: db.lessonProgress.filter((p) => p.status === "completed").length, accent: "cyan" as const },
    { icon: <Activity className="h-5 w-5" />, label: "Quiz attempts", value: db.quizAttempts.length, accent: "mint" as const },
    { icon: <Zap className="h-5 w-5" />, label: "Experiments run", value: db.experiments.length, accent: "amber" as const },
  ];

  const totalXpByUser = (id: string) => db.xp[id] ?? 0;

  const submitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    addResource({ title: form.title.trim(), description: form.description.trim() || "Curated by the QubitX team.", url: form.url.trim(), type: form.type, category: form.category });
    setForm({ title: "", description: "", url: "", type: "Article", category: "Beginner" });
  };

  const tabs = [
    ["overview", "Overview"], ["users", "Users"], ["content", "Lessons & quizzes"], ["resources", "Resources"],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Admin Panel"
        title={isAdmin ? "Platform Operations" : "Platform View (Admin Preview)"}
        sub={isAdmin
          ? "Manage learners, review content analytics, and curate the resource library."
          : "This prototype seeds the admin experience for demonstration. Contact the team to be granted admin rights."}
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-ink-850 p-1.5">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === id ? "bg-qx-violet/20 text-qx-violet" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {!isAdmin && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-qx-amber/30 bg-qx-amber/10 px-4 py-3 text-sm text-qx-amber">
          <Shield className="h-4 w-4 shrink-0" />
          Read-only preview — you're not an admin. Use the demo (Aarav) to try user management actions.
        </div>
      )}

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <BookOpen className="h-4.5 w-4.5 text-qx-violet" /> Top lessons by completions
              </h3>
              <div className="space-y-2.5">
                {[...LESSONS].sort((a, b) => lessonCompletions(b.id) - lessonCompletions(a.id)).slice(0, 6).map((l) => (
                  <div key={l.id} className="flex items-center gap-3">
                    <span className="w-6 text-right font-mono text-xs text-slate-500">{lessonCompletions(l.id)}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-white/5">
                      <div className="h-full rounded bg-gradient-to-r from-qx-violet/60 to-qx-indigo/60" style={{ width: `${Math.min(100, lessonCompletions(l.id) * 20)}%` }} />
                    </div>
                    <span className="w-44 truncate text-right text-xs text-slate-400">{l.title}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <GraduationCap className="h-4.5 w-4.5 text-qx-cyan" /> Quiz analytics
              </h3>
              {db.quizAttempts.length === 0 ? (
                <p className="text-sm text-slate-500">No quiz attempts recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {LESSONS.map((l) => {
                    const avg = lessonAvgScore(l.id);
                    if (avg === null) return null;
                    return (
                      <div key={l.id} className="flex items-center gap-3">
                        <span className="w-40 truncate text-xs text-slate-400">{l.title}</span>
                        <div className="h-4 flex-1 overflow-hidden rounded bg-white/5">
                          <div className={`h-full rounded ${avg >= 80 ? "bg-qx-mint/70" : avg >= 50 ? "bg-qx-amber/70" : "bg-rose-500/70"}`} style={{ width: `${avg}%` }} />
                        </div>
                        <span className="w-10 font-mono text-xs text-white">{avg}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {tab === "users" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Completed</th>
                <th className="px-5 py-3">XP</th>
                <th className="px-5 py-3">Quizzes</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-full" style={{ background: u.avatarColor }} />
                      <div>
                        <p className="font-medium text-white">{u.name} {u.isAdmin && <Badge color="amber"><Shield className="h-3 w-3" /> admin</Badge>} {u.id === "demo-user" && <Badge color="cyan">demo</Badge>}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300">{u.level}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">{db.lessonProgress.filter((p) => p.userId === u.id && p.status === "completed").length}/10</td>
                  <td className="px-5 py-3 font-mono text-qx-amber">{totalXpByUser(u.id)}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">{db.quizAttempts.filter((a) => a.userId === u.id).length}</td>
                  <td className="px-5 py-3 text-right">
                    {isAdmin && !u.isAdmin && u.id !== currentUser.id ? (
                      <button onClick={() => { if (confirm(`Delete ${u.name}? This removes all their progress.`)) deleteUser(u.id); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400" aria-label={`Delete ${u.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "content" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-white"><BookOpen className="h-4.5 w-4.5 text-qx-violet" /> Lessons & quiz questions</h3>
            <Badge color="violet">{LESSONS.length} lessons · {LESSONS.reduce((n, l) => n + l.quiz.length, 0)} questions</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {LESSONS.map((l) => {
              const avg = lessonAvgScore(l.id);
              return (
                <Card key={l.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Module {moduleById(l.moduleId)?.order} · {l.duration}</p>
                      <h4 className="mt-0.5 font-semibold text-white">{l.title}</h4>
                    </div>
                    <Badge color={l.id === "l3" ? "cyan" : "slate"}>+{l.xp} XP</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 text-slate-400">
                      {LESSONS.filter((x) => x.id === l.id)[0].sections.length} sections
                    </span>
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 text-slate-400">{l.quiz.length} quiz questions</span>
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 text-slate-400">{lessonCompletions(l.id)} completions</span>
                    {avg !== null && (
                      <span className={`rounded-lg px-2.5 py-1 ${avg >= 80 ? "bg-qx-mint/15 text-qx-mint" : "bg-qx-amber/15 text-qx-amber"}`}>
                        avg quiz {avg}%
                      </span>
                    )}
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-qx-cyan hover:underline">Preview quiz questions</summary>
                    <ul className="mt-2 space-y-2">
                      {l.quiz.map((q) => (
                        <li key={q.id} className="rounded-lg border border-white/5 bg-ink-900/60 p-2.5 text-xs text-slate-400">
                          <span className="text-slate-300">{q.question}</span>
                          <span className="mt-1 block font-mono text-qx-mint">✓ answer: {q.options[q.correctIndex]}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                  <Link to={`/learn/${l.id}`} className="mt-3 inline-block text-xs font-semibold text-slate-400 hover:text-white">Preview lesson →</Link>
                </Card>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-white/15 p-5">
            <BookPlus className="h-5 w-5 text-slate-500" />
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">Lesson authoring</span> — the content schema supports adding
              new lessons and quiz questions.
            </p>
            <Badge color="slate">Coming soon in beta</Badge>
          </div>
        </div>
      )}

      {tab === "resources" && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-white"><Plus className="h-4 w-4 text-qx-cyan" /> Add a resource</h3>
            <form onSubmit={submitResource} className="space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
                required
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-qx-violet/60 focus:outline-none"
              />
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-qx-violet/60 focus:outline-none"
              />
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://…"
                type="url"
                required
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-qx-violet/60 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ResourceItem["type"] })}
                  className="rounded-xl border border-white/10 bg-ink-900 px-2 py-2 text-sm text-white focus:outline-none"
                >
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ResourceItem["category"] })}
                  className="rounded-xl border border-white/10 bg-ink-900 px-2 py-2 text-sm text-white focus:outline-none"
                >
                  {CATEGORIES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={!isAdmin}>Add to library</Button>
              {!isAdmin && <p className="text-center text-xs text-slate-600">Requires admin rights</p>}
            </form>
          </Card>

          <div>
            <p className="mb-3 text-sm text-slate-500">{RESOURCES.length + (db.resources?.length ?? 0)} resources · {db.resources?.length ? `${db.resources.length} curated by you` : "seed library"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(db.resources ?? []).map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-qx-cyan/25 bg-qx-cyan/5 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.type} · {r.category}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteResource(r.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400" aria-label="Delete resource">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {RESOURCES.slice(0, 6).map((r) => (
                <div key={r.id} className="rounded-xl border border-white/8 bg-ink-900/50 p-3.5 opacity-70">
                  <p className="truncate text-sm font-medium text-slate-300">{r.title}</p>
                  <p className="text-xs text-slate-600">{r.type} · {r.category} · seed</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}