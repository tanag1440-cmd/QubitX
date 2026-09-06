import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  AppDB,
  ChallengeAttempt,
  CircuitOp,
  LessonProgress,
  QuantumExperiment,
  QuizAttempt,
  ResourceItem,
  User,
  UserAchievement,
} from "../types";
import { ACHIEVEMENTS, LESSONS, lessonById, LESSON_ORDER } from "../data/content";

const DB_KEY = "qubitx.db.v1";

// ── XP / level math ──────────────────────────────────────────────────────────

export const XP_PER_LEVEL = 150;
export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp: number) => xp % XP_PER_LEVEL;
export const xpForNextLevel = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL);

// ── Seed: demo user ──────────────────────────────────────────────────────────

function demoExperiment(name: string, circuit: CircuitOp[], numQubits: number, summary: string): QuantumExperiment {
  return { id: crypto.randomUUID(), userId: "demo-user", name, circuit, numQubits, resultSummary: summary, createdAt: new Date().toISOString() };
}

function seedDemo(): AppDB {
  const now = Date.now();
  const iso = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();
  const progress = (lessonId: string, status: LessonProgress["status"], pct: number, daysAgo: number): LessonProgress => ({
    userId: "demo-user", lessonId, status, progress: pct, lastActivityAt: iso(daysAgo),
  });
  const attempt = (lessonId: string, score: number, total: number, xpEarned: number, daysAgo: number): QuizAttempt => ({
    id: crypto.randomUUID(), userId: "demo-user", lessonId, score, total,
    answers: [], xpEarned, completedAt: iso(daysAgo),
  });
  const ach = (achievementId: string, daysAgo: number): UserAchievement => ({
    userId: "demo-user", achievementId, earnedAt: iso(daysAgo),
  });
  const chal = (challengeId: string, success: boolean, daysAgo: number): ChallengeAttempt => ({
    id: crypto.randomUUID(), userId: "demo-user", challengeId, success, attemptedAt: iso(daysAgo),
  });

  return {
    users: [{
      id: "demo-user",
      name: "Aarav Sharma",
      email: "demo@qubitx.app",
      password: "demo1234",
      avatarColor: "#8b5cf6",
      level: "Beginner",
      joinedAt: iso(14),
      isAdmin: true,
    }],
    lessonProgress: [
      progress("l1", "completed", 100, 6),
      progress("l2", "completed", 100, 5),
      progress("l3", "completed", 100, 3),
      progress("l4", "in_progress", 60, 1),
    ],
    quizAttempts: [
      attempt("l1", 3, 3, 40, 6),
      attempt("l2", 2, 3, 27, 5),
      attempt("l3", 3, 3, 40, 3),
    ],
    userAchievements: [
      ach("first-qubit", 6),
      ach("quantum-beginner", 5),
      ach("superposition-master", 3),
      ach("quiz-ace", 6),
      ach("lab-explorer", 2),
      ach("curious-mind", 1),
    ],
    experiments: [
      demoExperiment("Bell State", [
        { id: crypto.randomUUID(), gate: "H", qubits: [0], col: 0 },
        { id: crypto.randomUUID(), gate: "CNOT", qubits: [0, 1], col: 1 },
      ], 2, "50% |00⟩ · 50% |11⟩"),
      demoExperiment("Superposition", [
        { id: crypto.randomUUID(), gate: "H", qubits: [0], col: 0 },
      ], 1, "50% |0⟩ · 50% |1⟩"),
      demoExperiment("Flip & Measure", [
        { id: crypto.randomUUID(), gate: "X", qubits: [0], col: 0 },
      ], 1, "100% |1⟩"),
      demoExperiment("H · H = Identity", [
        { id: crypto.randomUUID(), gate: "H", qubits: [0], col: 0 },
        { id: crypto.randomUUID(), gate: "H", qubits: [0], col: 1 },
      ], 1, "100% |0⟩"),
    ],
    challengeAttempts: [chal("ch-superposition", true, 1)],
    streak: { current: 5, best: 5, lastActiveDay: new Date(now - 86400000).toISOString().slice(0, 10) },
    xp: { "demo-user": 730 },
    sessionUserId: null,
  };
}

// ── Empty DB ─────────────────────────────────────────────────────────────────

function emptyDB(): AppDB {
  return {
    users: [],
    lessonProgress: [],
    quizAttempts: [],
    userAchievements: [],
    experiments: [],
    challengeAttempts: [],
    streak: { current: 0, best: 0, lastActiveDay: null },
    xp: {},
    sessionUserId: null,
  };
}

function loadDB(): AppDB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return emptyDB();
    const parsed = JSON.parse(raw) as AppDB;
    if (!parsed.users || !parsed.lessonProgress) return emptyDB();
    return parsed;
  } catch {
    return emptyDB();
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

export interface QuizOutcome {
  score: number;
  total: number;
  xpEarned: number;
  perfect: boolean;
}

interface StoreValue {
  db: AppDB;
  currentUser: User | null;
  signup: (name: string, email: string, password: string, level: User["level"]) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  resetPassword: (email: string) => boolean;
  enterDemo: () => void;
  updateProfile: (name: string, level: User["level"]) => void;
  addResource: (r: Omit<ResourceItem, "id">) => void;
  deleteResource: (id: string) => void;
  deleteUser: (id: string) => void;
  recordActivity: () => void;
  completeLesson: (lessonId: string) => void;
  setLessonProgress: (lessonId: string, pct: number) => void;
  submitQuiz: (lessonId: string, answers: number[]) => QuizOutcome;
  addExperiment: (name: string, circuit: CircuitOp[], numQubits: number, summary: string) => void;
  askTutor: () => void;
  solveChallenge: (challengeId: string, success: boolean) => void;
  // derived
  completedLessonIds: string[];
  completedCount: number;
  totalXp: number;
  level: number;
  streakDays: number;
  bestStreak: number;
  earnedAchievements: UserAchievement[];
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<AppDB>(loadDB);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      // storage full / private mode — prototype tolerates this
    }
  }, [db]);

  const today = () => new Date().toISOString().slice(0, 10);
  const yesterday = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const withActivity = useCallback((d: AppDB): AppDB => {
    const s = d.streak;
    if (s.lastActiveDay === today()) return d;
    const next = s.lastActiveDay === yesterday() ? s.current + 1 : 1;
    return {
      ...d,
      streak: { current: next, best: Math.max(s.best, next), lastActiveDay: today() },
    };
  }, []);

  const isLessonComplete = (d: AppDB, lessonId: string) =>
    d.lessonProgress.some((p) => p.userId === d.sessionUserId && p.lessonId === lessonId && p.status === "completed");

  const countCompleted = (d: AppDB, userId: string) =>
    d.lessonProgress.filter((p) => p.userId === userId && p.status === "completed").length;

  const countExperiments = (d: AppDB, userId: string) =>
    d.experiments.filter((e) => e.userId === userId).length;

  const countChallenges = (d: AppDB, userId: string) =>
    d.challengeAttempts.filter((c) => c.userId === userId && c.success).length;

  const hasPerfectQuiz = (d: AppDB, userId: string) =>
    d.quizAttempts.some((a) => a.userId === userId && a.score === a.total);

  const countTutor = (d: AppDB, userId: string) =>
    d.userAchievements.some((a) => a.userId === userId && a.achievementId === "curious-mind") ? 1 : 0;

  const checkAchievements = useCallback((d: AppDB): AppDB => {
    const uid = d.sessionUserId;
    if (!uid) return d;
    const earned = new Set(d.userAchievements.filter((a) => a.userId === uid).map((a) => a.achievementId));
    const completed = countCompleted(d, uid);
    const experiments = countExperiments(d, uid);
    const challenges = countChallenges(d, uid);
    const xp = { ...d.xp };
    let changed = false;

    const grant = (id: string) => {
      if (earned.has(id)) return;
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) return;
      earned.add(id);
      xp[uid] = (xp[uid] ?? 0) + def.xp;
      changed = true;
    };

    if (completed >= 1) grant("first-qubit");
    if (experiments >= 5) grant("gate-explorer");
    if (isLessonComplete(d, "l3")) grant("superposition-master");
    if (isLessonComplete(d, "l7")) grant("entanglement-explorer");
    if (completed >= 3) grant("quantum-beginner");
    if (completed >= 6) grant("quantum-explorer");
    if (completed >= LESSONS.length) grant("quantum-ninja");
    if (hasPerfectQuiz(d, uid)) grant("quiz-ace");
    if (d.streak.current >= 3) grant("on-a-roll");
    if (challenges >= 1) grant("challenge-accepted");
    if (countTutor(d, uid) >= 1) grant("curious-mind");
    if (experiments >= 1) grant("lab-explorer");

    if (!changed) return d;
    return {
      ...d,
      xp,
      userAchievements: [...d.userAchievements, ...Array.from(earned)
        .filter((id) => !d.userAchievements.some((a) => a.userId === uid && a.achievementId === id))
        .map((id) => ({ userId: uid, achievementId: id, earnedAt: new Date().toISOString() }))],
    };
  }, []);

  const mutate = useCallback((fn: (d: AppDB) => AppDB) => {
    setDb((prev) => checkAchievements(withActivity(fn(prev))));
  }, [checkAchievements, withActivity]);

  // ── Auth ───────────────────────────────────────────────────────────────────

  const signup = useCallback((name: string, email: string, password: string, level: User["level"]): string | null => {
    const em = email.trim().toLowerCase();
    if (!name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(em)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (db.users.some((u) => u.email === em)) return "An account with this email already exists.";
    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: em,
      password,
      avatarColor: ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#fb7185"][Math.floor(Math.random() * 5)],
      level,
      joinedAt: new Date().toISOString(),
    };
    mutate((d) => ({ ...d, users: [...d.users, user], sessionUserId: user.id }));
    return null;
  }, [db.users, mutate]);

  const login = useCallback((email: string, password: string): string | null => {
    const em = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email === em);
    if (!user) return "No account found with this email.";
    if (user.password !== password) return "Incorrect password. Try again.";
    mutate((d) => ({ ...d, sessionUserId: user.id }));
    return null;
  }, [db.users, mutate]);

  const logout = useCallback(() => {
    mutate((d) => ({ ...d, sessionUserId: null }));
  }, [mutate]);

  const resetPassword = useCallback((email: string): boolean => {
    const exists = db.users.some((u) => u.email === email.trim().toLowerCase());
    return exists;
  }, [db.users]);

  const updateProfile = useCallback((name: string, level: User["level"]) => {
    mutate((d) => {
      const uid = d.sessionUserId;
      if (!uid) return d;
      return {
        ...d,
        users: d.users.map((u) => (u.id === uid ? { ...u, name: name.trim() || u.name, level } : u)),
      };
    });
  }, [mutate]);

  const addResource = useCallback((r: Omit<ResourceItem, "id">) => {
    setDb((prev) => ({
      ...prev,
      resources: [
        { ...r, id: crypto.randomUUID() },
        ...(prev.resources ?? []),
      ],
    }));
  }, []);

  const deleteResource = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      resources: (prev.resources ?? []).filter((r) => r.id !== id),
    }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    mutate((d) => {
      if (d.sessionUserId === id) return d; // never delete yourself via this
      const uid = d.sessionUserId;
      if (!uid) return d;
      const actor = d.users.find((u) => u.id === uid);
      if (!actor?.isAdmin) return d;
      return {
        ...d,
        users: d.users.filter((u) => u.id !== id),
        lessonProgress: d.lessonProgress.filter((p) => p.userId !== id),
        quizAttempts: d.quizAttempts.filter((a) => a.userId !== id),
        userAchievements: d.userAchievements.filter((a) => a.userId !== id),
        experiments: d.experiments.filter((e) => e.userId !== id),
        challengeAttempts: d.challengeAttempts.filter((c) => c.userId !== id),
      };
    });
  }, [mutate]);

  const enterDemo = useCallback(() => {
    setDb((prev) => {
      const demo = seedDemo();
      const hasDemo = prev.users.some((u) => u.id === "demo-user");
      const otherUsers = prev.users.filter((u) => u.id !== "demo-user");
      const merged: AppDB = {
        ...prev,
        users: [...otherUsers, ...demo.users],
        sessionUserId: "demo-user",
      };
      if (!hasDemo) {
        // First time: seed the demo user's full progress while preserving
        // any real accounts created before.
        merged.lessonProgress = [...prev.lessonProgress, ...demo.lessonProgress];
        merged.quizAttempts = [...prev.quizAttempts, ...demo.quizAttempts];
        merged.userAchievements = [...prev.userAchievements, ...demo.userAchievements];
        merged.experiments = [...demo.experiments, ...prev.experiments];
        merged.challengeAttempts = [...demo.challengeAttempts, ...prev.challengeAttempts];
        merged.streak = demo.streak;
        merged.xp = { ...prev.xp, ...demo.xp };
      }
      return merged;
    });
  }, []);

  // ── Learning actions ───────────────────────────────────────────────────────

  const completeLesson = useCallback((lessonId: string) => {
    mutate((d) => {
      const uid = d.sessionUserId;
      if (!uid) return d;
      const lesson = lessonById(lessonId);
      if (!lesson) return d;
      const already = d.lessonProgress.find((p) => p.userId === uid && p.lessonId === lessonId);
      const progress: LessonProgress = {
        userId: uid,
        lessonId,
        status: "completed",
        progress: 100,
        lastActivityAt: new Date().toISOString(),
      };
      const list = already
        ? d.lessonProgress.map((p) => (p.userId === uid && p.lessonId === lessonId ? progress : p))
        : [...d.lessonProgress, progress];
      const earnedXp = already?.status === "completed" ? 0 : lesson.xp;
      return {
        ...d,
        lessonProgress: list,
        xp: { ...d.xp, [uid]: (d.xp[uid] ?? 0) + earnedXp },
      };
    });
  }, [mutate]);

  const setLessonProgress = useCallback((lessonId: string, pct: number) => {
    mutate((d) => {
      const uid = d.sessionUserId;
      if (!uid) return d;
      const existing = d.lessonProgress.find((p) => p.userId === uid && p.lessonId === lessonId);
      const status: LessonProgress["status"] = pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started";
      const entry: LessonProgress = { userId: uid, lessonId, status, progress: pct, lastActivityAt: new Date().toISOString() };
      const list = existing
        ? d.lessonProgress.map((p) => (p.userId === uid && p.lessonId === lessonId ? entry : p))
        : [...d.lessonProgress, entry];
      return { ...d, lessonProgress: list };
    });
  }, [mutate]);

  const submitQuiz = useCallback((lessonId: string, answers: number[]): QuizOutcome => {
    const lesson = lessonById(lessonId);
    const questions = lesson?.quiz ?? [];
    const score = questions.reduce((n, q, i) => (answers[i] === q.correctIndex ? n + 1 : n), 0);
    const total = questions.length;
    const xpEarned = score === 0 ? 0 : Math.max(10, Math.round((score / total) * 40));
    mutate((d) => {
      const uid = d.sessionUserId;
      if (!uid) return d;
      const attempt: QuizAttempt = {
        id: crypto.randomUUID(),
        userId: uid,
        lessonId,
        score,
        total,
        answers,
        xpEarned,
        completedAt: new Date().toISOString(),
      };
      return {
        ...d,
        quizAttempts: [...d.quizAttempts, attempt],
        xp: { ...d.xp, [uid]: (d.xp[uid] ?? 0) + xpEarned },
      };
    });
    return { score, total, xpEarned, perfect: score === total };
  }, [mutate]);

  const addExperiment = useCallback((name: string, circuit: CircuitOp[], numQubits: number, summary: string) => {
    mutate((d) => {
      const uid = d.sessionUserId;
      if (!uid) return d;
      const exp: QuantumExperiment = {
        id: crypto.randomUUID(),
        userId: uid,
        name: name.trim() || "Untitled circuit",
        circuit,
        numQubits,
        resultSummary: summary,
        createdAt: new Date().toISOString(),
      };
      return {
        ...d,
        experiments: [exp, ...d.experiments].slice(0, 50),
        xp: { ...d.xp, [uid]: (d.xp[uid] ?? 0) + 10 },
      };
    });
  }, [mutate]);

  const askTutor = useCallback(() => {
    mutate((d) => d); // activity + achievement check (curious-mind via countTutor needs a marker)
    setDb((prev) => {
      const uid = prev.sessionUserId;
      if (!uid || prev.userAchievements.some((a) => a.userId === uid && a.achievementId === "curious-mind")) return prev;
      const marker: UserAchievement = { userId: uid, achievementId: "curious-mind", earnedAt: new Date().toISOString() };
      const def = ACHIEVEMENTS.find((a) => a.id === "curious-mind");
      return {
        ...prev,
        userAchievements: [...prev.userAchievements, marker],
        xp: { ...prev.xp, [uid]: (prev.xp[uid] ?? 0) + (def?.xp ?? 0) },
      };
    });
  }, [mutate]);

  const solveChallenge = useCallback((challengeId: string, success: boolean) => {
    mutate((d) => {
      const uid = d.sessionUserId;
      if (!uid) return d;
      const attempt: ChallengeAttempt = { id: crypto.randomUUID(), userId: uid, challengeId, success, attemptedAt: new Date().toISOString() };
      return {
        ...d,
        challengeAttempts: [...d.challengeAttempts, attempt],
        xp: { ...d.xp, [uid]: (d.xp[uid] ?? 0) + (success ? 50 : 0) },
      };
    });
  }, [mutate]);

  const recordActivity = useCallback(() => {
    mutate((d) => d);
  }, [mutate]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const currentUser = useMemo(
    () => db.users.find((u) => u.id === db.sessionUserId) ?? null,
    [db.users, db.sessionUserId]
  );

  const value = useMemo<StoreValue>(() => {
    const uid = db.sessionUserId;
    const completedLessonIds = uid
      ? db.lessonProgress.filter((p) => p.userId === uid && p.status === "completed").map((p) => p.lessonId)
      : [];
    const totalXp = uid ? (db.xp[uid] ?? 0) : 0;
    return {
      db,
      currentUser,
      signup,
      login,
      logout,
      resetPassword,
      enterDemo,
      updateProfile,
      addResource,
      deleteResource,
      deleteUser,
      recordActivity,
      completeLesson,
      setLessonProgress,
      submitQuiz,
      addExperiment,
      askTutor,
      solveChallenge,
      completedLessonIds,
      completedCount: completedLessonIds.length,
      totalXp,
      level: levelFromXp(totalXp),
      streakDays: db.streak.current,
      bestStreak: db.streak.best,
      earnedAchievements: uid ? db.userAchievements.filter((a) => a.userId === uid) : [],
    };
  }, [
    db, currentUser, signup, login, logout, resetPassword, enterDemo, updateProfile,
    addResource, deleteResource, deleteUser, recordActivity,
    completeLesson, setLessonProgress, submitQuiz, addExperiment, askTutor, solveChallenge,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Next lesson a user should continue (first incomplete in order). */
export function nextLesson(completedIds: string[]): { lessonId: string; index: number } | null {
  for (let i = 0; i < LESSON_ORDER.length; i++) {
    if (!completedIds.includes(LESSON_ORDER[i])) return { lessonId: LESSON_ORDER[i], index: i };
  }
  return null;
}

/** Overall completion percentage across all lessons. */
export function overallProgress(completedIds: string[]): number {
  return Math.round((completedIds.length / LESSON_ORDER.length) * 100);
}