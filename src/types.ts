// ── Core domain types for QubitX ────────────────────────────────────────────

export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // prototype only — would be hashed server-side in production
  avatarColor: string;
  level: Level;
  joinedAt: string;
  isAdmin?: boolean;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number; // 0–100
  lastActivityAt: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "multiple" | "truefalse" | "circuit" | "probability";
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  total: number;
  answers: number[]; // chosen option index per question
  xpEarned: number;
  completedAt: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  xp: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: string;
}

export interface QuantumExperiment {
  id: string;
  userId: string;
  name: string;
  circuit: CircuitOp[];
  numQubits: number;
  resultSummary?: string;
  createdAt: string;
}

export type GateType =
  | "H"
  | "X"
  | "Y"
  | "Z"
  | "S"
  | "T"
  | "CNOT"
  | "SWAP"
  | "M";

export interface CircuitOp {
  id: string;
  gate: GateType;
  qubits: number[]; // target(s); CNOT = [control, target]; SWAP = [a, b]
  col: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  targetCircuit: { gate: GateType; qubits: number[] }[];
  numQubits: number;
  xpReward: number;
  date: string; // yyyy-mm-dd
}

export interface ChallengeAttempt {
  id: string;
  userId: string;
  challengeId: string;
  success: boolean;
  attemptedAt: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: "Article" | "Video" | "Docs" | "Book" | "Course";
  category: "Beginner" | "Mathematics" | "Physics" | "Programming" | "Algorithms" | "Research" | "Career";
  description: string;
  url: string;
}

export interface ModuleDef {
  id: string;
  title: string;
  short: string;
  icon: string;
  duration: string; // "8 min"
  xp: number;
  order: number;
}

export interface LessonSection {
  kind: "text" | "demo" | "example" | "tryit" | "takeaway";
  heading?: string;
  body?: string;
  demo?: string; // demo component id
  example?: { title: string; body: string; code?: string };
}

export interface LessonDef {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  duration: string;
  xp: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  keyTakeaway: string;
}

// ── Quantum simulator types ──────────────────────────────────────────────────

export interface Complex {
  re: number;
  im: number;
}

export interface SimResult {
  probabilities: number[]; // per basis state, index = binary value
  state: Complex[];
  measuredBits: (0 | 1)[] | null;
  numQubits: number;
}

export interface BlochCoords {
  x: number;
  y: number;
  z: number;
}

// ── App store ────────────────────────────────────────────────────────────────

export interface AppDB {
  users: User[];
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  userAchievements: UserAchievement[];
  experiments: QuantumExperiment[];
  challengeAttempts: ChallengeAttempt[];
  streak: { current: number; best: number; lastActiveDay: string | null };
  xp: Record<string, number>; // userId -> total XP
  sessionUserId: string | null;
  resources?: ResourceItem[]; // user-added resources (admin-curated)
}