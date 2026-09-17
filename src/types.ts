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

  // ── Adaptive learning system (Qubit-X 2.0) ────────────────────────────────
  // All optional so existing localStorage databases load unchanged; the store
  // normalizes missing collections on read.
  learningProfiles?: UserLearningProfile[];
  topicMastery?: TopicMastery[];
  learningAttempts?: LearningAttempt[];
  circuitAttempts?: CircuitAttemptRecord[];
  mistakePatterns?: MistakePattern[];
  recommendations?: LearningRecommendation[];
  diagnostics?: DiagnosticResult[];
}

// ── Adaptive learning system types (Qubit-X 2.0) ─────────────────────────────

/** Difficulty ladder for challenges and adaptive adjustment. */
export type Difficulty = "Beginner" | "Easy" | "Intermediate" | "Advanced" | "Expert";

/** Selectable learning modes. */
export type LearningMode = "guided" | "practice" | "challenge" | "exam" | "experiment";

/** Learner-selected goal, used (with other signals) by the recommendation engine. */
export type LearningGoal =
  | "from-scratch"
  | "build-circuits"
  | "exam-prep"
  | "algorithms"
  | "machine-learning"
  | "programming"
  | "research";

/** Broad grouping used for display. */
export type TopicCategory =
  | "Foundations"
  | "Gates"
  | "Multi-qubit"
  | "Algorithms"
  | "Advanced";

export type TopicId =
  | "classical" | "qubits" | "quantum-states" | "superposition" | "measurement"
  | "quantum-gates" | "pauli-x" | "pauli-y" | "pauli-z" | "hadamard"
  | "s-gate" | "t-gate" | "rotation-gates" | "cnot" | "controlled-gates"
  | "entanglement" | "bell-states" | "ghz-states" | "quantum-teleportation"
  | "interference" | "circuits" | "algorithms" | "deutsch-jozsa" | "grover"
  | "shor" | "variational" | "qaoa" | "qml" | "noise" | "error-correction"
  | "frameworks";

/** Static catalog entry for a learning topic. */
export interface TopicDef {
  id: TopicId;
  name: string;
  category: TopicCategory;
  /** Topic ids that should be understood first. */
  prerequisites: TopicId[];
  /** One-line description shown in the learning path. */
  blurb: string;
  /** Optional existing lesson this topic maps onto. */
  lessonId?: string;
  /** Optional existing interactive demo id. */
  demoId?: string;
  /** Baseline difficulty for generated practice. */
  defaultDifficulty: Difficulty;
}

/** Per-learner aggregate profile. */
export interface UserLearningProfile {
  userId: string;
  overallMastery: number; // 0–100, derived from topic mastery
  learningGoal: LearningGoal | null;
  currentLevel: Level;
  mode: LearningMode;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Per-topic competency for a learner. */
export interface TopicMastery {
  userId: string;
  topicId: TopicId;
  mastery: number; // 0–100, dynamically calculated
  attempts: number;
  correctAttempts: number;
  averageTime: number; // seconds per attempt
  lastAttempted: string | null;
  lastRevised: string | null;
  confidence: number; // 0–1, rises with evidence
  difficulty: Difficulty; // current working difficulty for this topic
  /** Rolling recent scores (0–1) used for gradual difficulty adjustment. */
  recentScores: number[];
}

export type ActivityType = "diagnostic" | "quiz" | "challenge" | "circuit" | "revision" | "experiment";

/** A single learning interaction (quiz answer, challenge submit, circuit run…). */
export interface LearningAttempt {
  id: string;
  userId: string;
  activityId: string;
  topicId: TopicId;
  activityType: ActivityType;
  difficulty: Difficulty;
  score: number; // 0–1
  timeTaken: number; // seconds
  attemptNumber: number;
  hintsUsed: number;
  /** Mistake type identifiers recorded from this attempt. */
  mistakes: string[];
  createdAt: string;
}

/** A circuit execution submitted for a challenge, with ground-truth results. */
export interface CircuitAttemptRecord {
  id: string;
  userId: string;
  circuitId?: string;
  challengeId?: string;
  topicId: TopicId;
  framework: "local-simulator" | "qiskit" | "cirq" | "pennylane";
  circuitRepresentation: { gate: GateType; qubits: number[] }[];
  numQubits: number;
  executionResult: { probabilities: number[] };
  expectedResult: { probabilities: number[] } | null;
  success: boolean;
  errors: string[];
  createdAt: string;
}

/** A recurring misconception detected across attempts. */
export interface MistakePattern {
  id: string;
  userId: string;
  topicId: TopicId;
  mistakeType: string;
  label: string;
  frequency: number;
  severity: "low" | "medium" | "high";
  lastSeen: string;
  resolved: boolean;
}

export type RecommendationType = "learn" | "practice" | "revision" | "challenge" | "experiment";

/** A generated next-step recommendation. */
export interface LearningRecommendation {
  id: string;
  userId: string;
  topicId: TopicId;
  recommendationType: RecommendationType;
  title: string;
  reason: string;
  priority: number; // higher = more urgent
  createdAt: string;
  completed: boolean;
}

/** Result of the initial diagnostic assessment. */
export interface DiagnosticResult {
  userId: string;
  /** Per-topic percentage correct from the diagnostic. */
  topicScores: { topicId: TopicId; correct: number; total: number }[];
  overallScore: number; // 0–100
  summary: string;
  takenAt: string;
}

/** An AI-generated practice challenge. */
export interface AiChallenge {
  id: string;
  topicId: TopicId;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  /** Human-readable description of the required behaviour. */
  requirement: string;
  hints: string[];
  explanation: string;
  /** Behavioral (not gate-by-gate) validation spec. */
  spec: ChallengeSpec;
  numQubits: number;
  generatedAt: string;
}

/** Behavioral validation specs — validated by simulation, not gate matching. */
export type ChallengeSpec =
  | { kind: "state-vector-probabilities"; expectedProbabilities: number[]; tolerance: number }
  | { kind: "entangled-pair" }
  | { kind: "ghz"; numQubits: number }
  | { kind: "all-qubits-superposed"; numQubits: number }
  | { kind: "single-qubit-superposed"; qubit: number }
  | { kind: "basis-flip"; qubit: number }
  | { kind: "phase-applied"; qubit: number }
  | { kind: "product-state-match"; expectedProbabilities: number[]; tolerance: number };