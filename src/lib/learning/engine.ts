// ── Qubit-X adaptive learning engine ─────────────────────────────────────────
// Deterministic, testable learning logic. This module owns everything the
// requirements call "application logic" (scores, thresholds, aggregation,
// validation) so the UI never has to. The AI layer in `aiService.ts` consumes
// these results but never recomputes them.
//
// Ground-truth numbers always come from the real state-vector simulator in
// `../simulator` — the engine never invents probabilities or states.

import {
  cAbs2, cAdd, cConj, cMul, explainCircuit, probabilities, runCircuit,
} from "../simulator";
import type {
  ChallengeSpec, CircuitOp, Complex, DiagnosticResult, Difficulty, GateType,
  LearningGoal, LearningRecommendation, LearningAttempt, MistakePattern,
  RecommendationType, TopicDef, TopicId, TopicMastery,
} from "../../types";
import { DIAGNOSTIC, GOAL_TOPIC_WEIGHTS, TOPICS, topicById, topicName } from "../../data/learningTopics";

// ── Small helpers ────────────────────────────────────────────────────────────

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const DIFFICULTY_ORDER: Difficulty[] = ["Beginner", "Easy", "Intermediate", "Advanced", "Expert"];

export const difficultyIndex = (d: Difficulty) => DIFFICULTY_ORDER.indexOf(d);

/** Mastery bands used for colour/labels across the UI. */
export function masteryBand(m: number, attempts = 0): { label: string; tone: "slate" | "rose" | "amber" | "cyan" | "mint" | "violet" } {
  if (attempts === 0) return { label: "Not started", tone: "slate" };
  if (m >= 80) return { label: "Mastered", tone: "mint" };
  if (m >= 60) return { label: "Proficient", tone: "cyan" };
  if (m >= 40) return { label: "Developing", tone: "amber" };
  return { label: "Needs work", tone: "rose" };
}

export function emptyMastery(userId: string, topicId: TopicId, difficulty: Difficulty): TopicMastery {
  return {
    userId, topicId, mastery: 0, attempts: 0, correctAttempts: 0, averageTime: 0,
    lastAttempted: null, lastRevised: null, confidence: 0, difficulty,
    recentScores: [],
  };
}

export function masteryMap(list: TopicMastery[] = [], userId?: string): Map<TopicId, TopicMastery> {
  const m = new Map<TopicId, TopicMastery>();
  for (const t of list) {
    if (userId && t.userId !== userId) continue;
    m.set(t.topicId, t);
  }
  return m;
}

export function getMastery(map: Map<TopicId, TopicMastery>, userId: string, topicId: TopicId): TopicMastery {
  return map.get(topicId) ?? emptyMastery(userId, topicId, topicById(topicId)?.defaultDifficulty ?? "Beginner");
}

/** Overall mastery = mean of measured topics, weighted by evidence. */
export function overallMastery(list: TopicMastery[] = [], userId?: string): number {
  const measured = list.filter((t) => (!userId || t.userId === userId) && t.attempts > 0);
  if (measured.length === 0) return 0;
  const weighted = measured.reduce((s, t) => s + t.mastery * (1 + t.confidence), 0);
  const weight = measured.reduce((s, t) => s + (1 + t.confidence), 0);
  return Math.round(weighted / weight);
}

// ── Mastery update ───────────────────────────────────────────────────────────

/**
 * Fold one attempt into a topic's mastery using an evidence-weighted moving
 * average. Better attempts raise mastery; poor attempts lower it *gently* —
 * mistakes are learning signals, not punishments.
 */
export function applyAttemptToMastery(prev: TopicMastery, attempt: LearningAttempt): TopicMastery {
  const scorePct = clamp(attempt.score, 0, 1) * 100;
  const diffBoost = 1 + difficultyIndex(attempt.difficulty) * 0.12; // harder work moves the needle more
  const first = prev.attempts === 0;
  // First evidence dominates; later evidence nudges. Downward moves are damped.
  const baseAlpha = first ? 0.7 : 0.32;
  const alpha = Math.min(0.8, baseAlpha * diffBoost);
  const upward = scorePct >= prev.mastery;
  const effectiveAlpha = upward ? alpha : alpha * 0.7; // gentler corrections downward

  const mastery = clamp(prev.mastery + effectiveAlpha * (scorePct - prev.mastery), 0, 100);
  const attempts = prev.attempts + 1;
  const correctAttempts = prev.correctAttempts + (attempt.score >= 0.6 ? 1 : 0);
  const averageTime = prev.averageTime === 0
    ? attempt.timeTaken
    : (prev.averageTime * prev.attempts + attempt.timeTaken) / attempts;

  const recentScores = [...prev.recentScores, clamp(attempt.score, 0, 1)].slice(-5);
  // Confidence rises with the number of attempts and with consistency.
  const spread = recentScores.length > 1 ? Math.max(...recentScores) - Math.min(...recentScores) : 0;
  const consistency = clamp(1 - spread, 0, 1);
  const confidence = clamp(Math.min(1, attempts / 5) * 0.7 + consistency * 0.3, 0, 1);

  return {
    ...prev,
    mastery: Math.round(mastery),
    attempts,
    correctAttempts,
    averageTime: Math.round(averageTime),
    lastAttempted: attempt.createdAt,
    confidence: Number(confidence.toFixed(3)),
    recentScores,
    difficulty: nextDifficulty(prev.difficulty, recentScores),
  };
}

/**
 * Gradual difficulty adjustment: only ever moves one step, and only after a
 * clear, repeated signal. Two strong results in a row step up; two weak
 * results step down (to "Guided" practice, never below Beginner).
 */
export function nextDifficulty(current: Difficulty, recentScores: number[]): Difficulty {
  if (recentScores.length < 2) return current;
  const last2 = recentScores.slice(-2);
  const avg = last2.reduce((s, n) => s + n, 0) / last2.length;
  const i = difficultyIndex(current);
  if (avg >= 0.85 && last2.every((s) => s >= 0.7)) return DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, i + 1)];
  if (avg <= 0.45 && last2.every((s) => s <= 0.6)) return DIFFICULTY_ORDER[Math.max(0, i - 1)];
  return current;
}

// ── Mistake memory ───────────────────────────────────────────────────────────

export const MISTAKE_LABELS: Record<string, string> = {
  "bit-qubit-confusion": "Confusing bits with qubits",
  "hidden-variable-view": "Treating a qubit as secretly 0 or 1",
  "amplitude-as-probability": "Reading amplitudes as probabilities",
  "measurement-ignores-amplitudes": "Ignoring amplitude probabilities at measurement",
  "measurement-survives-collapse": "Expecting superposition to survive measurement",
  "x-z-confusion": "Mixing up the X and Z gates",
  "phase-blind": "Overlooking phase (invisible to measurement)",
  "cnot-control-confusion": "Reversing CNOT control and target",
  "cnot-no-superposition": "Using CNOT without first creating superposition",
  "bell-state-outcomes": "Misreading which outcomes a Bell state allows",
  "entanglement-as-independence": "Treating entangled qubits as independent",
  "interference-missed": "Missing amplitude cancellation",
  "grover-complexity": "Misremembering Grover's speedup",
  "noise-unaware": "Overlooking decoherence and noise",
  "measurement-placement": "Measuring before the circuit is finished",
  "double-hadamard": "Cancelling Hadamard gates unintentionally",
  "goal-distribution-mismatch": "Circuit output differs from the stated goal",
  "not-entangled": "Circuit does not create entanglement",
};

export function mistakeLabel(type: string): string {
  return MISTAKE_LABELS[type] ?? type.replace(/-/g, " ");
}

/** Record (or reinforce) a recurring misconception. */
export function recordMistake(
  patterns: MistakePattern[],
  userId: string,
  topicId: TopicId,
  mistakeType: string,
  now = new Date().toISOString()
): MistakePattern[] {
  const existing = patterns.find((p) => p.userId === userId && p.topicId === topicId && p.mistakeType === mistakeType);
  if (!existing) {
    return [
      ...patterns,
      {
        id: crypto.randomUUID(), userId, topicId, mistakeType, label: mistakeLabel(mistakeType),
        frequency: 1, severity: "low", lastSeen: now, resolved: false,
      },
    ];
  }
  const frequency = existing.frequency + 1;
  const severity: MistakePattern["severity"] = frequency >= 4 ? "high" : frequency >= 2 ? "medium" : "low";
  return patterns.map((p) =>
    p.id === existing.id ? { ...p, frequency, severity, lastSeen: now, resolved: false } : p
  );
}

/** Mark a misconception resolved once the learner succeeds on that topic. */
export function resolveMistakes(patterns: MistakePattern[], userId: string, topicId: TopicId): MistakePattern[] {
  return patterns.map((p) =>
    p.userId === userId && p.topicId === topicId && !p.resolved ? { ...p, resolved: true } : p
  );
}

/** Unresolved patterns, most severe first. */
export function activeMistakes(patterns: MistakePattern[] = [], userId?: string): MistakePattern[] {
  return patterns
    .filter((p) => (!userId || p.userId === userId) && !p.resolved)
    .sort((a, b) => b.frequency - a.frequency || a.mistakeType.localeCompare(b.mistakeType));
}

// ── Circuit analysis (ground truth via the simulator) ─────────────────────────

export interface CircuitAnalysis {
  numQubits: number;
  gateCount: number;
  operations: CircuitOp[];
  /** Circuit with measurement ops stripped — "what would we see if we measured now". */
  idealProbabilities: number[];
  idealState: Complex[];
  measuredBits: (0 | 1)[] | null;
  entangled: boolean;
  /** Qubit pairs that interact through any 2-qubit gate. */
  interactions: [number, number][];
  gateUsage: { gate: GateType; count: number }[];
  hasMeasurement: boolean;
  nonZeroOutcomes: { index: number; probability: number }[];
  explanation: string;
}

/** Strip measurements so we can inspect the pre-measurement distribution. */
export function stripMeasurement(ops: CircuitOp[]): CircuitOp[] {
  return ops.filter((o) => o.gate !== "M");
}

/**
 * Rigorous purity test: for a PURE global state, the state is a product state
 * (unentangled) iff every single-qubit reduced state is pure. So if any qubit's
 * reduced Bloch vector has length < 1, the state is entangled.
 */
export function isEntangledPure(state: Complex[], numQubits: number): boolean {
  const dim = 1 << numQubits;
  if (state.length !== dim || numQubits < 2) return false;
  for (let q = 0; q < numQubits; q++) {
    // Build the 2×2 reduced density matrix for qubit q.
    const rho: Complex[][] = [[{ re: 0, im: 0 }, { re: 0, im: 0 }], [{ re: 0, im: 0 }, { re: 0, im: 0 }]];
    for (let b = 0; b < 2; b++) {
      for (let bp = 0; bp < 2; bp++) {
        let sum: Complex = { re: 0, im: 0 };
        const restCount = dim >> 1;
        for (let rest = 0; rest < restCount; rest++) {
          // Scatter the bits of `rest` into all qubit positions except q.
          let idx = 0;
          let pos = 0;
          for (let k = 0; k < numQubits; k++) {
            if (k === q) continue;
            if ((rest >> pos) & 1) idx |= 1 << k;
            pos++;
          }
          const i1 = idx | (b << q);
          const i2 = idx | (bp << q);
          sum = cAdd(sum, cMul(state[i1], cConj(state[i2])));
        }
        rho[b][bp] = sum;
      }
    }
    const x = 2 * rho[0][1].re;
    const y = -2 * rho[0][1].im;
    const z = rho[0][0].re - rho[1][1].re;
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r < 1 - 1e-6) return true; // a mixed single-qubit state ⇒ genuinely entangled
  }
  return false;
}

export function analyzeCircuit(ops: CircuitOp[], numQubits: number): CircuitAnalysis {
  const operations = [...ops].sort((a, b) => a.col - b.col);
  const noM = stripMeasurement(operations);
  const ideal = runCircuit(noM, numQubits);
  const withM = runCircuit(operations, numQubits);

  const usage = new Map<GateType, number>();
  const interactions = new Set<string>();
  for (const o of operations) {
    usage.set(o.gate, (usage.get(o.gate) ?? 0) + 1);
    if ((o.gate === "CNOT" || o.gate === "SWAP") && o.qubits.length === 2) {
      interactions.add([...o.qubits].sort((a, b) => a - b).join("-"));
    }
  }

  const entangled = isEntangledPure(ideal.state, numQubits);
  const probs = probabilities(ideal.state);
  const nonZeroOutcomes = probs
    .map((p, index) => ({ index, probability: p }))
    .filter((o) => o.probability > 1e-6)
    .sort((a, b) => b.probability - a.probability);

  return {
    numQubits,
    gateCount: noM.length,
    operations,
    idealProbabilities: probs,
    idealState: ideal.state,
    measuredBits: withM.measuredBits,
    entangled,
    interactions: Array.from(interactions).map((s) => s.split("-").map(Number) as [number, number]),
    gateUsage: Array.from(usage.entries()).map(([gate, count]) => ({ gate, count })),
    hasMeasurement: operations.some((o) => o.gate === "M"),
    nonZeroOutcomes,
    explanation: explainCircuit(operations, numQubits),
  };
}

// ── "Debug my circuit" ───────────────────────────────────────────────────────

export interface DebugIssue {
  severity: "high" | "medium" | "low";
  issue: string;
  why: string;
  hint: string;
  mistakeType: string;
}

/**
 * Deterministic circuit review. Reports concrete, grounded issues — never
 * invented ones. `spec` (when supplied) is the challenge's required behaviour,
 * so debugging can compare the real distribution against the goal.
 */
export function debugCircuit(
  ops: CircuitOp[],
  numQubits: number,
  spec?: ChallengeSpec
): { issues: DebugIssue[]; summary: string } {
  const issues: DebugIssue[] = [];
  const a = analyzeCircuit(ops, numQubits);
  const gates = a.operations;

  if (gates.length === 0) {
    issues.push({
      severity: "low", mistakeType: "empty-circuit",
      issue: "Your circuit is empty.",
      why: "Every qubit starts in |0⟩, so measuring now would give 0 for every qubit.",
      hint: "Add a gate from the palette to get started — try H for superposition, X to flip.",
    });
    return { issues, summary: "Nothing to run yet — add at least one gate." };
  }

  // Invalid two-qubit placement.
  for (const o of gates) {
    if (o.gate === "CNOT" && o.qubits[0] === o.qubits[1]) {
      issues.push({
        severity: "high", mistakeType: "invalid-cnot",
        issue: "A CNOT gate has its control and target on the same qubit.",
        why: "A conditional flip needs two different qubits — one to decide, one to flip.",
        hint: "Delete that CNOT and place the control on one wire and the target on another.",
      });
    }
  }

  // Gates after measurement on the same qubit.
  const maxMeasCol = Math.max(-1, ...gates.filter((o) => o.gate === "M").map((o) => o.col));
  for (const o of gates) {
    if (o.gate !== "M" && o.col > maxMeasCol && maxMeasCol >= 0) {
      const measuredQubits = new Set(gates.filter((g) => g.gate === "M").map((g) => g.qubits[0]));
      if (o.qubits.some((q) => measuredQubits.has(q))) {
        issues.push({
          severity: "medium", mistakeType: "measurement-placement",
          issue: "A gate is applied to a qubit after that qubit was measured.",
          why: "Measurement collapses the qubit to a definite 0 or 1, so later gates act on a classical value, not a superposition.",
          hint: "Move all measurement gates to the end of the circuit (rightmost column).",
        });
        break;
      }
    }
  }

  // CNOT without any superposition source.
  const hasTwoQubit = gates.some((o) => o.gate === "CNOT" || o.gate === "SWAP");
  const hasH = gates.some((o) => o.gate === "H");
  if (hasTwoQubit && !hasH) {
    const entanglingGoal = !spec || spec.kind === "entangled-pair" || spec.kind === "ghz";
    if (entanglingGoal) {
      issues.push({
        severity: "high", mistakeType: "cnot-no-superposition",
        issue: "Your circuit is unlikely to create an entangled state.",
        why: "Starting from |00⟩, a CNOT alone only ever sees a control of |0⟩, so it never flips anything. Entanglement needs the control in a superposition first.",
        hint: "Try applying a Hadamard gate to the control qubit before the CNOT.",
      });
    }
  }

  // Accidental cancellation.
  const byQubit = new Map<number, CircuitOp[]>();
  for (const o of gates.filter((g) => g.gate !== "M" && g.qubits.length === 1)) {
    const list = byQubit.get(o.qubits[0]) ?? [];
    list.push(o);
    byQubit.set(o.qubits[0], list);
  }
  for (const [q, list] of byQubit) {
    for (let i = 0; i + 1 < list.length; i++) {
      if (list[i].gate === "H" && list[i + 1].gate === "H") {
        const goalWantsSuperposition = spec?.kind === "single-qubit-superposed" || spec?.kind === "all-qubits-superposed";
        issues.push({
          severity: goalWantsSuperposition ? "high" : "low", mistakeType: "double-hadamard",
          issue: `Two Hadamard gates in a row on qubit ${q} cancel each other out.`,
          why: "H is its own inverse (H·H = identity), so the pair leaves the qubit exactly where it started.",
          hint: goalWantsSuperposition
            ? "Remove both H gates and apply a single H to keep the superposition."
            : "If the cancellation was intentional, this is fine — it's a neat interference demo.",
        });
        break;
      }
    }
  }

  // Objective check against the challenge spec.
  if (spec) {
    const result = validateSpec(ops, numQubits, spec);
    if (!result.pass) {
      issues.push({
        severity: "high", mistakeType: result.mistakeType ?? "goal-distribution-mismatch",
        issue: "Your circuit doesn't yet produce the required behaviour.",
        why: result.message,
        hint: result.hint,
      });
    }
  }

  const order: Record<DebugIssue["severity"], number> = { high: 0, medium: 1, low: 2 };
  issues.sort((x, y) => order[x.severity] - order[y.severity]);

  const summary = issues.length === 0
    ? "No problems found — this circuit is structurally sound and behaves as you'd expect."
    : `${issues.length} thing${issues.length > 1 ? "s" : ""} worth looking at, most important first.`;

  return { issues, summary };
}

// ── Behavioral validation ────────────────────────────────────────────────────

export interface ValidationResult {
  pass: boolean;
  message: string;
  hint: string;
  mistakeType?: string;
  actualProbabilities: number[];
  expectedProbabilities: number[] | null;
}

function fmtDist(probs: number[], n: number): string {
  return probs
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p > 0.01)
    .sort((x, y) => y.p - x.p)
    .map(({ p, i }) => `|${i.toString(2).padStart(n, "0")}⟩ ${Math.round(p * 100)}%`)
    .join(" · ");
}

function matchProbabilities(actual: number[], expected: number[], tol: number): boolean {
  if (actual.length !== expected.length) return false;
  return actual.every((p, i) => Math.abs(p - expected[i]) <= tol);
}

/**
 * Validate a submitted circuit against a required *behaviour*. Equivalent
 * circuits built differently are accepted — we compare simulated distributions
 * and structural properties, never gate-by-gate.
 */
export function validateSpec(ops: CircuitOp[], numQubits: number, spec: ChallengeSpec): ValidationResult {
  const a = analyzeCircuit(ops, numQubits);
  const probs = a.idealProbabilities;

  switch (spec.kind) {
    case "state-vector-probabilities":
    case "product-state-match": {
      const pass = matchProbabilities(probs, spec.expectedProbabilities, spec.tolerance);
      return {
        pass,
        actualProbabilities: probs,
        expectedProbabilities: spec.expectedProbabilities,
        message: pass
          ? `Your distribution matches the goal: ${fmtDist(probs, numQubits)}.`
          : `Your distribution is ${fmtDist(probs, numQubits)}, but the goal needs ${fmtDist(spec.expectedProbabilities, numQubits)}.`,
        hint: "Compare your gates with the required behaviour one step at a time: what does each gate do to the state?",
        mistakeType: "goal-distribution-mismatch",
      };
    }
    case "single-qubit-superposed": {
      const p = probs;
      const pass = p.length === 2 && Math.abs(p[0] - 0.5) <= 0.05 && Math.abs(p[1] - 0.5) <= 0.05;
      return {
        pass, actualProbabilities: p, expectedProbabilities: [0.5, 0.5],
        message: pass
          ? "Both outcomes are equally likely — that's a true equal superposition."
          : `Your qubit measures as ${fmtDist(p, 1)}, not an even 50/50 split.`,
        hint: "A single Hadamard on a |0⟩ qubit gives exactly 50/50.",
        mistakeType: "goal-distribution-mismatch",
      };
    }
    case "all-qubits-superposed": {
      const expected = new Array(1 << spec.numQubits).fill(1 / (1 << spec.numQubits));
      const pass = matchProbabilities(probs, expected, 0.05);
      return {
        pass, actualProbabilities: probs, expectedProbabilities: expected,
        message: pass
          ? "Every basis state is equally likely — both qubits are independently superposed."
          : `Your distribution is ${fmtDist(probs, numQubits)}, but independent superpositions make all ${expected.length} outcomes equally likely.`,
        hint: "Apply a Hadamard to each qubit separately.",
        mistakeType: "goal-distribution-mismatch",
      };
    }
    case "basis-flip": {
      const expected = new Array(1 << numQubits).fill(0);
      const idx = 1 << spec.qubit;
      expected[idx] = 1;
      const pass = matchProbabilities(probs, expected, 0.02);
      return {
        pass, actualProbabilities: probs, expectedProbabilities: expected,
        message: pass
          ? "Qubit is in the |1⟩ state with certainty. Nicely done."
          : `The qubit measures as ${fmtDist(probs, numQubits)}, not a certain |1⟩.`,
        hint: "The X gate flips a qubit from |0⟩ to |1⟩.",
        mistakeType: "goal-distribution-mismatch",
      };
    }
    case "phase-applied": {
      const noPhase = stripMeasurement(ops);
      const hasPhaseGate = noPhase.some((o) => ["Z", "S", "T"].includes(o.gate) && o.qubits[0] === spec.qubit);
      const measuresOne = probs[1 << spec.qubit] > 0.98;
      const pass = hasPhaseGate && measuresOne;
      return {
        pass, actualProbabilities: probs, expectedProbabilities: null,
        message: pass
          ? "A phase gate is applied and the qubit still measures as 1 — the phase is real but invisible to measurement."
          : "This circuit doesn't apply a phase gate to the target qubit while keeping it in the |1⟩ state.",
        hint: "Put the qubit in |1⟩ first, then apply a Z / S / T gate.",
        mistakeType: "phase-blind",
      };
    }
    case "entangled-pair": {
      if (!a.entangled) {
        return {
          pass: false, actualProbabilities: probs, expectedProbabilities: [0.5, 0, 0, 0.5],
          message: `Your circuit produces ${fmtDist(probs, numQubits)}, but the qubits are still independent — not entangled.`,
          hint: "Superpose the control qubit with a Hadamard, then apply a CNOT to the other.",
          mistakeType: "not-entangled",
        };
      }
      const pass = matchProbabilities(probs, [0.5, 0, 0, 0.5], 0.05);
      return {
        pass, actualProbabilities: probs, expectedProbabilities: [0.5, 0, 0, 0.5],
        message: pass
          ? "Perfect — the qubits are genuinely entangled and always agree."
          : `The qubits are entangled, but the distribution is ${fmtDist(probs, numQubits)} rather than an even 50/50 on |00⟩ and |11⟩.`,
        hint: "For the (|00⟩ + |11⟩)/√2 Bell state, superpose q0 then CNOT(q0→q1).",
        mistakeType: "goal-distribution-mismatch",
      };
    }
    case "ghz": {
      const n = spec.numQubits;
      const expected = new Array(1 << n).fill(0);
      expected[0] = 0.5;
      expected[(1 << n) - 1] = 0.5;
      const pass = a.entangled && matchProbabilities(probs, expected, 0.05);
      return {
        pass, actualProbabilities: probs, expectedProbabilities: expected,
        message: pass
          ? `All ${n} qubits are entangled in a GHZ state — only all-zeros and all-ones occur.`
          : `Your distribution is ${fmtDist(probs, n)}, but a GHZ state gives only |${"0".repeat(n)}⟩ and |${"1".repeat(n)}⟩ at 50% each.`,
        hint: "Superpose the first qubit, then CNOT from it to every other qubit.",
        mistakeType: a.entangled ? "goal-distribution-mismatch" : "not-entangled",
      };
    }
  }
}

// ── Diagnostic scoring ───────────────────────────────────────────────────────

export interface DiagnosticScore {
  result: DiagnosticResult;
  /** Seed mastery values to merge into the learner's profile. */
  seed: { topicId: TopicId; mastery: number }[];
  mistakes: { topicId: TopicId; mistakeType: string }[];
  /** Data-derived recommendation shown right after the diagnostic. */
  recommendation: { topicId: TopicId; text: string };
}

export function scoreDiagnostic(answers: number[], userId: string, now = new Date().toISOString()): DiagnosticScore {
  const byTopic = new Map<TopicId, { correct: number; total: number }>();
  const mistakes: { topicId: TopicId; mistakeType: string }[] = [];
  let correctTotal = 0;

  DIAGNOSTIC.forEach((q, i) => {
    const entry = byTopic.get(q.topicId) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[i] === q.correctIndex) {
      entry.correct += 1;
      correctTotal += 1;
    } else if (q.mistakeType) {
      mistakes.push({ topicId: q.topicId, mistakeType: q.mistakeType });
    }
    byTopic.set(q.topicId, entry);
  });

  const topicScores = Array.from(byTopic.entries()).map(([topicId, v]) => ({ topicId, correct: v.correct, total: v.total }));
  const overall = Math.round((correctTotal / DIAGNOSTIC.length) * 100);

  const seed = topicScores.map(({ topicId, correct, total }) => ({
    topicId,
    // Diagnostic gives a coarse prior, never full mastery: cap so practice still matters.
    // A perfect section is treated as mastered so already-competent learners can
    // skip ahead; anything else is a coarse prior, never full mastery.
    mastery: correct === total ? 82 : clamp(Math.round((correct / total) * 100 * 0.7), 5, 70),
  }));

  // Identify strongest and weakest measured topics for a grounded summary.
  const measured = topicScores
    .map((t) => ({ ...t, pct: t.total ? t.correct / t.total : 0 }))
    .sort((a, b) => b.pct - a.pct);
  const strongest = measured.filter((m) => m.pct >= 0.75).map((m) => topicName(m.topicId));
  const weakest = measured.filter((m) => m.pct < 0.6).sort((a, b) => a.pct - b.pct).map((m) => m.topicId);

  const focus = weakest[0] ?? measured[measured.length - 1]?.topicId ?? "superposition";
  const focusDef = topicById(focus);

  const summaryParts: string[] = [];
  if (strongest.length) summaryParts.push(`You're already solid on ${strongest.slice(0, 3).join(", ")}.`);
  if (weakest.length) {
    summaryParts.push(`Your main gap is ${topicName(weakest[0])}${weakest[1] ? ` (then ${topicName(weakest[1])})` : ""}.`);
  } else {
    summaryParts.push("Your fundamentals are broad and consistent — time to push into harder material.");
  }
  summaryParts.push(`We'll shape your path accordingly, starting with ${focusDef?.name ?? focus}.`);

  const focusPct = measured.find((m) => m.topicId === focus);
  const recommendationText = weakest.length
    ? `You already have a good grasp of ${strongest.slice(0, 2).join(" and ") || "the basics"}. Your biggest gap is ${topicName(focus)}${focusPct ? ` (${Math.round(focusPct.pct * 100)}% correct)` : ""}, so we'll strengthen that before moving on to harder material.`
    : `You scored ${overall}% overall — strong across the board. Your path will skip ahead to more challenging work in ${topicName(focus)} and beyond.`;

  return {
    result: { userId, topicScores, overallScore: overall, summary: summaryParts.join(" "), takenAt: now },
    seed,
    mistakes,
    recommendation: { topicId: focus, text: recommendationText },
  };
}

// ── Recommendation engine ────────────────────────────────────────────────────

export interface RecommendationInput {
  userId: string;
  mastery: TopicMastery[];
  mistakes: MistakePattern[];
  goal: LearningGoal | null;
  completedLessonIds: string[];
  now?: Date;
}

const REVISION_INTERVAL_DAYS = 7;

const DEPTH_CACHE = new Map<TopicId, number>();

/** Longest prerequisite chain above a topic (0 for a foundation topic). */
function topicDepth(id: TopicId): number {
  const cached = DEPTH_CACHE.get(id);
  if (cached !== undefined) return cached;
  const t = topicById(id);
  if (!t || t.prerequisites.length === 0) {
    DEPTH_CACHE.set(id, 0);
    return 0;
  }
  const depth = 1 + Math.max(...t.prerequisites.map(topicDepth));
  DEPTH_CACHE.set(id, depth);
  return depth;
}

/**
 * Decide what the learner should do next from *actual* data: prerequisite
 * readiness, mastery level, unresolved misconceptions, goal weighting, and
 * staleness of previously mastered topics.
 */
export function buildRecommendations(input: RecommendationInput): LearningRecommendation[] {
  const { userId, mastery, mistakes, goal, now = new Date() } = input;
  const map = masteryMap(mastery, userId);
  const goalTopics = new Set<TopicId>(goal ? GOAL_TOPIC_WEIGHTS[goal] : []);
  const active = activeMistakes(mistakes, userId);
  const recs: LearningRecommendation[] = [];
  const iso = now.toISOString();

  const scoreOf = (id: TopicId) => map.get(id)?.mastery ?? 0;
  const hasEvidence = (id: TopicId) => (map.get(id)?.attempts ?? 0) > 0;
  const ready = (t: TopicDef) => t.prerequisites.every((p) => scoreOf(p) >= 55);
  const goalBoost = (id: TopicId) => (goalTopics.has(id) ? 8 : 0);
  const goalNote = (id: TopicId) =>
    goal && goalTopics.has(id) ? ` It's also central to your goal: ${goal.replace(/-/g, " ")}.` : "";

  // Priority bands: evidenced misconceptions > evidenced weaknesses (and the
  // prerequisites blocking them) > stale-mastery revision > unmeasured topics.
  // Unmeasured topics must never outrank a demonstrated weakness, otherwise a
  // strong learner is told to start from the very beginning.

  // ── Band 1: targeted practice for recurring misconceptions ──
  const worstByTopic = new Map<TopicId, MistakePattern>();
  for (const mp of active) {
    const prev = worstByTopic.get(mp.topicId);
    if (!prev || mp.frequency > prev.frequency) worstByTopic.set(mp.topicId, mp);
  }
  for (const [topicId, mp] of worstByTopic) {
    const t = topicById(topicId);
    if (!t || !ready(t)) continue;
    recs.push({
      id: crypto.randomUUID(), userId, topicId, recommendationType: "revision",
      title: `${t.name} — targeted practice`,
      reason: `We've noticed "${mp.label.toLowerCase()}" ${mp.frequency} time${mp.frequency > 1 ? "s" : ""} in ${t.name} exercises. A few focused reps will clear it up.${goalNote(topicId)}`,
      priority: 300 + mp.frequency, createdAt: iso, completed: false,
    });
  }

  // ── Band 2: evidenced weaknesses, or the prerequisite that blocks them ──
  const weak = TOPICS
    .filter((t) => hasEvidence(t.id) && scoreOf(t.id) < 70)
    .sort((a, b) => scoreOf(a.id) - scoreOf(b.id));

  for (const t of weak) {
    const score = scoreOf(t.id);
    // Only divert to a prerequisite we have *evidence* is weak. An unmeasured
    // prerequisite is unknown — treating it as a confirmed blocker would send a
    // strong learner back to basics on no evidence at all.
    const unmet = t.prerequisites.filter((p) => hasEvidence(p) && scoreOf(p) < 55);
    if (unmet.length > 0) {
      const prereq = topicById(unmet[0]);
      if (!prereq) continue;
      const viaPrereq: RecommendationType = hasEvidence(prereq.id) ? "practice" : "learn";
      recs.push({
        id: crypto.randomUUID(), userId, topicId: prereq.id,
        recommendationType: viaPrereq,
        title: `${viaPrereq === "practice" ? "Strengthen" : "Learn"} ${prereq.name}`,
        reason: `${t.name} sits at ${score}%, but it depends on ${prereq.name} (${scoreOf(prereq.id)}%). Closing that prerequisite gap is the fastest route forward.${goalNote(prereq.id)}`,
        priority: 150 + (55 - scoreOf(prereq.id)), createdAt: iso, completed: false,
      });
      continue;
    }
    const attempts = map.get(t.id)?.attempts ?? 0;
    const type: RecommendationType = score < 25 ? "learn" : score < 60 ? "practice" : "challenge";
    recs.push({
      id: crypto.randomUUID(), userId, topicId: t.id, recommendationType: type,
      title: type === "learn" ? `Learn ${t.name}` : type === "practice" ? `${t.name} — guided practice` : `${t.name} — challenge`,
      reason: `${t.name} is at ${score}% after ${attempts} attempt${attempts === 1 ? "" : "s"} — your weakest evidenced area right now.${goalNote(t.id)}`,
      priority: 130 + (70 - score) + goalBoost(t.id), createdAt: iso, completed: false,
    });
  }

  // ── Band 3: revision of previously mastered topics that went stale ──
  for (const t of TOPICS) {
    const m = map.get(t.id);
    if (!m || m.attempts === 0 || m.mastery < 80) continue;
    const ref = m.lastAttempted ?? m.lastRevised;
    if (!ref) continue;
    const days = (now.getTime() - new Date(ref).getTime()) / 86400000;
    if (days <= REVISION_INTERVAL_DAYS) continue;
    recs.push({
      id: crypto.randomUUID(), userId, topicId: t.id, recommendationType: "revision",
      title: `${t.name} — quick review`,
      reason: `You mastered ${t.name} (${m.mastery}%) but haven't touched it in ${Math.round(days)} days. A short recall check keeps it sharp.`,
      priority: 80 + Math.min(20, days), createdAt: iso, completed: false,
    });
  }

  // ── Band 4: genuinely new topics whose prerequisites are met ──
  // Depth grows with the prerequisite chain, and is weighted by overall
  // mastery, so a strong learner is pointed at deep material while a beginner
  // still starts from the foundations.
  const overall = overallMastery(mastery, userId);
  for (const t of TOPICS) {
    if (map.has(t.id) || !ready(t)) continue;
    const depthBonus = Math.round(topicDepth(t.id) * (overall / 100) * 6);
    recs.push({
      id: crypto.randomUUID(), userId, topicId: t.id, recommendationType: "learn",
      title: `Learn ${t.name}`,
      reason: `You haven't started ${t.name} yet, and its prerequisites are already in place. ${t.blurb}${goalNote(t.id)}`,
      priority: 40 + goalBoost(t.id) + depthBonus, createdAt: iso, completed: false,
    });
  }

  return dedupeByTopic(recs);
}

/** Keep only the highest-priority recommendation per topic, sorted best-first. */
function dedupeByTopic(recs: LearningRecommendation[]): LearningRecommendation[] {
  const seen = new Set<TopicId>();
  const out: LearningRecommendation[] = [];
  for (const r of [...recs].sort((a, b) => b.priority - a.priority)) {
    if (seen.has(r.topicId)) continue;
    seen.add(r.topicId);
    out.push(r);
  }
  return out;
}

/** One-line "strengths / gaps / next step" summary built only from real data. */
export function learningSummary(mastery: TopicMastery[], userId: string, mistakes: MistakePattern[]) {
  const measured = mastery.filter((m) => m.userId === userId && m.attempts > 0).sort((a, b) => b.mastery - a.mastery);
  const strengths = measured.filter((m) => m.mastery >= 75).map((m) => topicName(m.topicId));
  const gaps = measured.filter((m) => m.mastery < 60).map((m) => topicName(m.topicId));
  const active = activeMistakes(mistakes, userId);
  return {
    strengths,
    gaps,
    strengthsText: strengths.length
      ? `Strong understanding of ${strengths.slice(0, 3).join(", ")}.`
      : "No topics are firmly established yet — that's completely normal at the start.",
    gapsText: gaps.length
      ? `${gaps.slice(0, 3).join(", ")} need${gaps.length === 1 ? "s" : ""} more practice.`
      : "No significant gaps detected in what you've covered so far.",
    activeMistakes: active,
  };
}

// ── Concept-visualisation helpers used by the UI ──────────────────────────────

export function formatProbabilityRow(probs: number[], n: number): { label: string; probability: number }[] {
  return probs.map((p, i) => ({ label: `|${i.toString(2).padStart(n, "0")}⟩`, probability: p }));
}

export { cAbs2 };
