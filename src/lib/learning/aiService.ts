// ── Qubit-X AI service layer ─────────────────────────────────────────────────
// Every response here is assembled from *real application data*: the circuit the
// learner actually built and the results the simulator actually produced. It
// never invents gates, probabilities, states, or execution results.
//
// This is the seam where a real LLM would be plugged in: keep the exported
// function signatures and structured return types, and replace the bodies with
// API calls. Until then, everything is deterministic and grounded.

import {
  applyOp, c, describeState, formatAmplitude, ket, probabilities, runCircuit, zeroState,
} from "../simulator";
import type { Complex, CircuitOp, GateType, TopicId } from "../../types";
import { answerQuery, type TutorMode as KnowledgeMode } from "../aiTutor";
import { CHALLENGE_TEMPLATES, DIAGNOSTIC, topicById, topicName } from "../../data/learningTopics";
import {
  analyzeCircuit, clamp, debugCircuit, difficultyIndex, masteryBand, validateSpec,
} from "./engine";
import type { AiChallenge, Difficulty, ChallengeSpec } from "../../types";

// ── Topic matching (so the tutor can be context-aware) ───────────────────────

const TOPIC_KEYWORDS: { id: TopicId; words: string[] }[] = [
  { id: "classical", words: ["bit", "classical", "binary"] },
  { id: "qubits", words: ["qubit", "ket", "bloch sphere"] },
  { id: "quantum-states", words: ["state", "amplitude", "normaliz", "bra-ket", "vector"] },
  { id: "superposition", words: ["superposition", "blend", "both at once"] },
  { id: "measurement", words: ["measure", "collapse", "observe"] },
  { id: "quantum-gates", words: ["gate", "unitary", "matrix", "reversible"] },
  { id: "pauli-x", words: ["pauli-x", "x gate", "not gate", "flip"] },
  { id: "pauli-y", words: ["pauli-y", "y gate"] },
  { id: "pauli-z", words: ["pauli-z", "z gate", "phase flip"] },
  { id: "hadamard", words: ["hadamard", "h gate"] },
  { id: "s-gate", words: ["s gate", "  s ", "sqrt z"] },
  { id: "t-gate", words: ["t gate", "fourth root"] },
  { id: "rotation-gates", words: ["rotation", "rx", "ry", "rz", "theta", "parameter"] },
  { id: "cnot", words: ["cnot", "control", "target", "cx"] },
  { id: "controlled-gates", words: ["controlled", "toffoli", "ccx"] },
  { id: "entanglement", words: ["entangl", "spooky", "correlat"] },
  { id: "bell-states", words: ["bell", "phi", "psi+"] },
  { id: "ghz-states", words: ["ghz"] },
  { id: "quantum-teleportation", words: ["teleport"] },
  { id: "interference", words: ["interference", "amplitude amplification", "cancel"] },
  { id: "circuits", words: ["circuit", "wire", "program"] },
  { id: "algorithms", words: ["algorithm", "speedup", "advantage"] },
  { id: "deutsch-jozsa", words: ["deutsch", "jozsa", "balanced"] },
  { id: "grover", words: ["grover", "search", "oracle"] },
  { id: "shor", words: ["shor", "factor", "rsa", "period"] },
  { id: "variational", words: ["variational", "vqe", "ansatz", "optimiz"] },
  { id: "qaoa", words: ["qaoa", "approximate optimization"] },
  { id: "qml", words: ["machine learning", "qml", "kernel", "feature map"] },
  { id: "noise", words: ["noise", "decoherence", "nisq", "error rate"] },
  { id: "error-correction", words: ["error correction", "fault toler", "syndrome", "surface code"] },
  { id: "frameworks", words: ["qiskit", "cirq", "pennylane", "framework", "sdk"] },
];

export function matchTopic(text: string): TopicId | null {
  const q = text.toLowerCase();
  let best: TopicId | null = null;
  let bestLen = 0;
  for (const { id, words } of TOPIC_KEYWORDS) {
    for (const w of words) {
      if (q.includes(w) && w.length > bestLen) {
        best = id;
        bestLen = w.length;
      }
    }
  }
  return best;
}

// ── Circuit analysis → structured explanation ────────────────────────────────

export interface CircuitExplanation {
  steps: { gate: string; effect: string }[];
  initialState: string;
  finalState: string;
  transformation: string;
  distribution: { label: string; probability: number }[];
  outcomes: string;
  entangled: boolean;
  text: string;
  /** True when the explanation refers to measurement-collapsed values. */
  hasMeasurement: boolean;
}

const GATE_EFFECT: Record<string, (q: number[]) => string> = {
  H: (q) => `applies a Hadamard to q${q[0]} — creating an equal superposition of |0⟩ and |1⟩, with a phase sign that matters later`,
  X: (q) => `flips q${q[0]} (|0⟩ ↔ |1⟩)`,
  Y: (q) => `flips q${q[0]} and adds a phase — a 180° rotation about the Y axis`,
  Z: (q) => `applies a phase flip to q${q[0]} (|1⟩ → −|1⟩), invisible to measurement but real in the state`,
  S: (q) => `rotates the phase of q${q[0]} by 90° (|1⟩ → i|1⟩)`,
  T: (q) => `rotates the phase of q${q[0]} by 45° (|1⟩ → e^{iπ/4}|1⟩)`,
  CNOT: (q) => `makes q${q[1]} depend on q${q[0]}: the target flips only when the control is |1⟩`,
  SWAP: (q) => `exchanges the states of q${q[0]} and q${q[1]}`,
  M: (q) => `measures q${q[0]}, collapsing it to a definite 0 or 1`,
};

function bitsLabel(i: number, n: number): string {
  return "|" + i.toString(2).padStart(n, "0") + "⟩";
}

/**
 * Produce a step-by-step, factually grounded explanation of a circuit. All
 * numbers come straight from `runCircuit` on the learner's actual circuit.
 */
export function explainCircuitStructured(ops: CircuitOp[], numQubits: number): CircuitExplanation {
  const a = analyzeCircuit(ops, numQubits);
  const sorted = a.operations;

  const steps = sorted.map((op) => ({
    gate: op.gate === "CNOT" || op.gate === "SWAP"
      ? `${op.gate}(q${op.qubits[0]}, q${op.qubits[1]})`
      : `${op.gate}(q${op.qubits[0]})`,
    effect: (GATE_EFFECT[op.gate] ?? (() => "applies an operation"))(op.qubits),
  }));

  const distribution = a.idealProbabilities.map((p, i) => ({ label: bitsLabel(i, numQubits), probability: p }));
  const nonZero = distribution.filter((d) => d.probability > 0.005);

  const outcomes = nonZero.length === 1
    ? `${nonZero[0].label} with certainty (${(nonZero[0].probability * 100).toFixed(0)}%)`
    : nonZero.map((d) => `${d.label} ${(d.probability * 100).toFixed(0)}%`).join(" · ");

  const initialState = `|${"0".repeat(numQubits)}⟩`;
  const finalState = describeState(a.idealState, numQubits);

  const textParts: string[] = [];
  textParts.push(`Your circuit starts from ${initialState} and applies ${a.gateCount} gate${a.gateCount === 1 ? "" : "s"}.`);
  steps.forEach((s, i) => textParts.push(`${i + 1}. ${s.gate} ${s.effect}.`));
  if (a.entangled) textParts.push("The two qubits end up genuinely entangled — their outcomes are correlated, not independent.");
  textParts.push(`If measured now, the outcomes would be: ${outcomes}.`);
  if (a.hasMeasurement) {
    textParts.push("Because your circuit includes measurement, a single run collapses to one of those outcomes — the distribution describes the odds across many runs.");
  }

  return {
    steps,
    initialState,
    finalState,
    transformation: `${initialState} → ${finalState}`,
    distribution,
    outcomes,
    entangled: a.entangled,
    hasMeasurement: a.hasMeasurement,
    text: textParts.join(" "),
  };
}

// ── Debug report (friendlier wrapper over the engine) ────────────────────────

export interface DebugReport {
  summary: string;
  issues: { severity: "high" | "medium" | "low"; title: string; why: string; hint: string }[];
  distribution: { label: string; probability: number }[];
}

export function debugReport(ops: CircuitOp[], numQubits: number, spec?: ChallengeSpec): DebugReport {
  const { issues, summary } = debugCircuit(ops, numQubits, spec);
  const a = analyzeCircuit(ops, numQubits);
  return {
    summary,
    issues: issues.map((i) => ({ severity: i.severity, title: i.issue, why: i.why, hint: i.hint })),
    distribution: a.idealProbabilities.map((p, i2) => ({ label: bitsLabel(i2, numQubits), probability: p })),
  };
}

// ── Tutor (modes + context) ──────────────────────────────────────────────────

export type AiTutorMode = "explain" | "hint" | "socratic" | "step" | "challenge" | "simplify" | "advanced";

export const TUTOR_MODES: { id: AiTutorMode; label: string; hint: string }[] = [
  { id: "explain", label: "Explain", hint: "Explain at my current level" },
  { id: "hint", label: "Hint", hint: "Nudge me without giving it away" },
  { id: "socratic", label: "Socratic", hint: "Ask me guiding questions" },
  { id: "step", label: "Step-by-step", hint: "Walk through it in detail" },
  { id: "challenge", label: "Challenge", hint: "Generate a problem on this topic" },
  { id: "simplify", label: "Simplify", hint: "Explain with a simpler analogy" },
  { id: "advanced", label: "Advanced", hint: "Give me the math" },
];

export interface TutorContext {
  /** Learner-facing level, from their profile. */
  level: "Beginner" | "Intermediate" | "Advanced";
  /** Mastery for the matched topic, if known. */
  topicMastery: number | null;
  /** The circuit currently in the builder, if any. */
  circuit?: { ops: CircuitOp[]; numQubits: number } | null;
  /** Topic the learner is currently in, if any. */
  topicId?: TopicId | null;
  /** Unresolved misconceptions for the current topic. */
  knownMistakes?: string[];
  /**
   * Engine-produced recommendations for this learner, already ranked. Supplied
   * so "what should I learn next?" is answered from the adaptive engine rather
   * than from the generic knowledge base.
   */
  recommendations?: { title: string; reason: string; recommendationType?: string }[];
  /** Overall mastery across measured topics, if known. */
  overallMastery?: number | null;
}

export interface TutorAnswer {
  mode: AiTutorMode;
  topicId: TopicId | null;
  topic: string;
  title: string;
  answer: string;
  /** Extra grounded detail, e.g. circuit facts. */
  grounded?: string[];
  followUps: string[];
}

/**
 * Questions about the learner's *own* progress or next step. These are answered
 * from the adaptive engine's output, never from the generic knowledge base —
 * a generic essay would be worse than useless here.
 */
const ADVICE_PATTERN = /should i (learn|do|study|practi[cs]e|try)|what.?s next|what next|next step|recommend|weakest|strongest|weak area|how am i doing|my progress|my mastery|my streak|improv/i;

export const isAdviceQuestion = (q: string) => ADVICE_PATTERN.test(q);

function adviceAnswer(ctx: TutorContext): string | null {
  const has = ctx.recommendations?.length || typeof ctx.overallMastery === "number";
  if (!has) return null;
  const rec = ctx.recommendations?.[0];
  const lines: string[] = [];
  lines.push(
    typeof ctx.overallMastery === "number"
      ? `Here's what your own learning data says — overall quantum mastery is ${ctx.overallMastery}%.`
      : "Here's what your own learning data says."
  );
  if (rec) {
    lines.push(`Next step: “${rec.title}”.`);
    lines.push(rec.reason);
  } else {
    lines.push("Nothing is flagged as urgent right now — keep practising with challenges to consolidate what you have.");
  }
  if (ctx.knownMistakes?.length) {
    lines.push(`Worth watching: you've mixed up ${ctx.knownMistakes.join(", ")} before, so we're working that in.`);
  }
  lines.push("This comes from your topic mastery, your recent attempts and your recorded misconceptions — not from a script.");
  return lines.join("\n");
}

function depthFor(ctx: TutorContext, topicId: TopicId | null): KnowledgeMode {
  const m = ctx.topicMastery ?? 0;
  if (ctx.level === "Advanced" && m >= 60) return "deeper";
  if (ctx.level === "Beginner" || m < 35) return "simple";
  return "simple";
}

/**
 * Answer a question in the requested mode. Concept knowledge comes from the
 * curated `aiTutor` base; anything about the learner's own circuit is computed
 * from that circuit via the simulator. If we cannot ground the answer, we say so.
 */
export function tutorRespond(question: string, mode: AiTutorMode, ctx: TutorContext): TutorAnswer {
  const q = question.trim();
  const topicId = matchTopic(q) ?? ctx.topicId ?? null;
  const topic = topicId ? topicName(topicId) : "Quantum computing";

  // Progress/next-step questions are answered from the adaptive engine's output.
  if (isAdviceQuestion(q)) {
    const advice = adviceAnswer(ctx);
    if (advice) {
      return {
        mode,
        topicId,
        topic,
        title: "What to learn next",
        answer: advice,
        followUps: [
          "Give me a challenge on that",
          "Explain that topic simply",
          "Why is that my weakest area?",
        ],
      };
    }
  }

  // Circuit-aware path: the learner is asking about their own circuit.
  const mentionsCircuit = /my circuit|this circuit|what does it do|what happened|current circuit|explain circuit|my qubits/i.test(q);
  if (mentionsCircuit) {
    if (!ctx.circuit || ctx.circuit.ops.length === 0) {
      return {
        mode, topicId, topic, title: "Your circuit is empty",
        answer: "There's nothing in the circuit builder yet, so there's no circuit for me to analyse. Add a gate (try H on q0) and ask me again — I'll read the actual circuit and explain exactly what it does.",
        followUps: ["What does a Hadamard gate do?", "Show me a Bell state circuit"],
      };
    }
    const analysis = analyzeCircuit(ctx.circuit.ops, ctx.circuit.numQubits);
    const grounded = [
      `Gates: ${analysis.gateUsage.map((g) => `${g.gate}×${g.count}`).join(", ") || "none"}.`,
      `Ideal distribution: ${analysis.idealProbabilities
        .map((p, i) => ({ p, s: bitsLabel(i, ctx.circuit!.numQubits) }))
        .filter((x) => x.p > 0.005)
        .map((x) => `${x.s} ${(x.p * 100).toFixed(0)}%`)
        .join(" · ")}.`,
      analysis.entangled ? "The qubits are genuinely entangled." : "The qubits are not entangled — the state is a product state.",
    ];
    if (mode === "socratic") {
      return {
        mode, topicId, topic, title: "Let's inspect your circuit together",
        answer: `You have ${analysis.gateCount} gate${analysis.gateCount === 1 ? "" : "s"} on ${ctx.circuit.numQubits} qubit${ctx.circuit.numQubits === 1 ? "" : "s"}. Before I tell you what it does — what do you expect the first gate to change? And after the last gate, what do you predict the measurement distribution will be?`,
        grounded, followUps: ["Explain my circuit", "Debug my circuit"],
      };
    }
    return {
      mode, topicId, topic, title: "What your circuit does",
      answer: explainCircuitStructured(ctx.circuit.ops, ctx.circuit.numQubits).text,
      grounded, followUps: ["Debug my circuit", "What happens if I remove the Hadamard?"],
    };
  }

  // Challenge-generation mode.
  if (mode === "challenge") {
    const targetTopic = topicId ?? "superposition";
    const c2 = generateCircuitChallenge(targetTopic, ctx.level === "Advanced" ? "Advanced" : "Intermediate");
    if (c2) {
      return {
        mode, topicId: targetTopic, topic: topicName(targetTopic), title: c2.title,
        answer: `${c2.prompt}\n\n${c2.requirement}\n\nHint: ${c2.hints[0]}`,
        followUps: ["Give me a harder one", "Explain this concept simply"],
      };
    }
    return {
      mode, topicId: targetTopic, topic: topicName(targetTopic), title: "Practice idea",
      answer: `Build a circuit for ${topicName(targetTopic)} and run it — then ask me "explain my circuit". I'll check the real distribution and tell you whether it matches the goal.`,
      followUps: ["What is a Bell state?", "Explain superposition"],
    };
  }

  if (!topicId) {
    const res = answerQuery(q, depthFor(ctx, null));
    return {
      mode, topicId: null, topic: "Quantum computing", title: "Here's what I know",
      answer: res.simple,
      grounded: ctx.knownMistakes?.length
        ? [`Heads up — you've previously mixed up: ${ctx.knownMistakes.join(", ")}.`]
        : undefined,
      followUps: ["What is a qubit?", "Explain superposition simply", "What is entanglement?"],
    };
  }

  const res = answerQuery(q, depthFor(ctx, topicId));
  const topicDef = topicById(topicId);
  const m = ctx.topicMastery;

  let answer: string;
  switch (mode) {
    case "simplify":
      answer = answerQuery(q, "analogy").example;
      break;
    case "advanced":
      answer = answerQuery(q, "math").math;
      break;
    case "step": {
      // Curated deeper text, decomposed into explicit steps for readability.
      const deeper = answerQuery(q, "deeper").deeper;
      const sentences = deeper.split(/(?<=\.)\s+/).filter(Boolean);
      answer = [`Let's take ${topic} step by step.`, ...sentences.map((s, i) => `${i + 1}. ${s}`)].join("\n");
      break;
    }
    case "socratic":
      answer = [
        `Instead of the answer, let me ask you a few questions about ${topic}:`,
        `1. In your own words, what is ${topic} about?`,
        `2. Think of an example — what would change if you measured right after creating it?`,
        `3. Can you connect it to something you already know (a gate, or a state you've built)?`,
        `Answer those in your head (or build it in the Lab), then hit Explain and compare.`,
      ].join("\n");
      break;
    case "hint":
      answer = [
        `Here's a nudge rather than the answer.`,
        `Recall: ${res.example}`,
        `Now try to apply that to your own circuit or question — what follows for the qubit's state?`,
      ].join("\n");
      break;
    case "explain":
    default:
      answer = res.simple;
      break;
  }

  const grounded: string[] = [];
  if (typeof m === "number") {
    grounded.push(`Your current ${topic} mastery is ${m}% (${masteryBand(m, m > 0 ? 1 : 0).label}).`);
  }
  if (ctx.knownMistakes?.length) {
    grounded.push(`Noted misconception${ctx.knownMistakes.length > 1 ? "s" : ""} in ${topic}: ${ctx.knownMistakes.join(", ")}.`);
  }
  if (topicDef?.lessonId) grounded.push(`Related lesson: module ${topicDef.lessonId.replace("l", "")}.`);

  return {
    mode, topicId, topic,
    title: `${TUTOR_MODES.find((t) => t.id === mode)?.label ?? "Explain"} — ${topic}`,
    answer,
    grounded: grounded.length ? grounded : undefined,
    followUps: [
      `Give me a ${topic} challenge`,
      `Explain ${topic} with an analogy`,
      `What's the math behind ${topic}?`,
    ],
  };
}

// ── Feedback after an attempt ────────────────────────────────────────────────

export interface AttemptFeedback {
  correct: boolean;
  headline: string;
  detail: string;
  hint?: string;
  offerHarder: boolean;
  mistakeType?: string;
}

export function attemptFeedback(params: {
  success: boolean;
  kind: "quiz" | "challenge" | "circuit";
  topicName: string;
  score?: number;
  distribution?: string;
  expected?: string;
  difficulty?: Difficulty;
  reason?: string;
}): AttemptFeedback {
  const { success, kind, topicName, score, distribution, expected, difficulty, reason } = params;
  if (success) {
    const detail = kind === "circuit"
      ? `Your circuit produced the required behaviour${distribution ? `: ${distribution}` : ""}. That's exactly the behaviour the task asked for.`
      : `You scored ${score !== undefined ? `${Math.round(score * 100)}%` : "full marks"} on ${topicName}. ${reason ?? ""}`.trim();
    return {
      correct: true,
      headline: kind === "circuit" ? `Correct — ${topicName} achieved.` : `Correct — nice work on ${topicName}.`,
      detail,
      offerHarder: difficulty ? difficultyIndex(difficulty) < 4 : true,
    };
  }
  return {
    correct: false,
    headline: `Not quite — let's look at ${topicName}.`,
    detail: kind === "circuit"
      ? `Your circuit's distribution ${distribution ? `was ${distribution}` : "didn't match"}${expected ? `, but the goal needs ${expected}` : ""}. ${reason ?? ""}`.trim()
      : reason ?? `That answer didn't match what ${topicName} requires.`,
    hint: "Change one thing at a time and re-run — small experiments make the cause clear.",
    offerHarder: false,
  };
}

// ── Quantum Experiment Mode: compare two circuits ────────────────────────────

export interface ExperimentComparison {
  originalDistribution: { label: string; probability: number }[];
  modifiedDistribution: { label: string; probability: number }[];
  differences: string[];
  explanation: string;
}

export function compareCircuits(
  original: { ops: CircuitOp[]; numQubits: number },
  modified: { ops: CircuitOp[]; numQubits: number },
  changeLabel: string
): ExperimentComparison {
  const n = Math.max(original.numQubits, modified.numQubits);
  const a = analyzeCircuit(original.ops, original.numQubits);
  const b = analyzeCircuit(modified.ops, modified.numQubits);

  const differences: string[] = [];
  for (let i = 0; i < 1 << n; i++) {
    const pa = a.idealProbabilities[i] ?? 0;
    const pb = b.idealProbabilities[i] ?? 0;
    if (Math.abs(pa - pb) > 0.01) {
      differences.push(`${bitsLabel(i, n)}: ${(pa * 100).toFixed(0)}% → ${(pb * 100).toFixed(0)}%`);
    }
  }
  if (a.entangled !== b.entangled) {
    differences.push(b.entangled ? "The modified circuit becomes entangled; the original did not." : "The modified circuit is no longer entangled.");
  }

  const explanation = differences.length === 0
    ? `Removing/modifying "${changeLabel}" left the distribution unchanged: ${a.idealProbabilities
        .map((p, i) => ({ p, s: bitsLabel(i, n) }))
        .filter((x) => x.p > 0.005)
        .map((x) => `${x.s} ${(x.p * 100).toFixed(0)}%`)
        .join(" · ")}. Some gates only affect the global phase, which measurement cannot see — so the change is real in the state but invisible in the counts.`
    : `After "${changeLabel}", ${differences.length} outcome${differences.length > 1 ? "s" : ""} changed. ${a.entangled && !b.entangled ? "The most important effect: the circuit lost its entanglement. " : ""}${!a.entangled && b.entangled ? "The most important effect: the circuit gained entanglement. " : ""}This is the heart of quantum intuition — one gate can redistribute probability mass across the whole distribution.`;

  return {
    originalDistribution: a.idealProbabilities.map((p, i) => ({ label: bitsLabel(i, original.numQubits), probability: p })),
    modifiedDistribution: b.idealProbabilities.map((p, i) => ({ label: bitsLabel(i, modified.numQubits), probability: p })),
    differences,
    explanation,
  };
}

// ── Cross-framework learning (representation, not execution) ─────────────────

export interface FrameworkSnippets {
  qiskit: string;
  cirq: string;
  pennylane: string;
  note: string;
}

const QISKIT_GATE: Record<string, (q: number[]) => string> = {
  H: (q) => `qc.h(${q[0]})`, X: (q) => `qc.x(${q[0]})`, Y: (q) => `qc.y(${q[0]})`,
  Z: (q) => `qc.z(${q[0]})`, S: (q) => `qc.s(${q[0]})`, T: (q) => `qc.t(${q[0]})`,
  CNOT: (q) => `qc.cx(${q[0]}, ${q[1]})`, SWAP: (q) => `qc.swap(${q[0]}, ${q[1]})`,
  M: () => `qc.measure_all()`,
};
const CIRQ_GATE: Record<string, (q: number[]) => string> = {
  H: (q) => `cirq.H(q[${q[0]}])`, X: (q) => `cirq.X(q[${q[0]}])`, Y: (q) => `cirq.Y(q[${q[0]}])`,
  Z: (q) => `cirq.Z(q[${q[0]}])`, S: (q) => `cirq.S(q[${q[0]}])`, T: (q) => `cirq.T(q[${q[0]}])`,
  CNOT: (q) => `cirq.CNOT(q[${q[0]}], q[${q[1]}])`, SWAP: (q) => `cirq.SWAP(q[${q[0]}], q[${q[1]}])`,
  M: () => `cirq.measure(*q, key='result')`,
};
const PENNYLANE_GATE: Record<string, (q: number[]) => string> = {
  H: (q) => `qml.Hadamard(wires=${q[0]})`, X: (q) => `qml.PauliX(wires=${q[0]})`,
  Y: (q) => `qml.PauliY(wires=${q[0]})`, Z: (q) => `qml.PauliZ(wires=${q[0]})`,
  S: (q) => `qml.S(wires=${q[0]})`, T: (q) => `qml.T(wires=${q[0]})`,
  CNOT: (q) => `qml.CNOT(wires=[${q[0]}, ${q[1]}])`, SWAP: (q) => `qml.SWAP(wires=[${q[0]}, ${q[1]}])`,
  M: () => `return qml.counts()`,
};

function emit(map: Record<string, (q: number[]) => string>, ops: CircuitOp[], n: number): string {
  return ops
    .slice()
    .sort((a, b) => a.col - b.col)
    .map((o) => (map[o.gate] ?? (() => `# ${o.gate}`))(o.qubits))
    .join("\n");
}

/**
 * Show how one logical circuit is written in each framework. These are factual
 * API mappings; the *ideal* result of the circuit is identical in all three
 * (unitary evolution is framework-independent). Real per-framework execution is
 * not wired up in this prototype and is labelled as such.
 */
export function frameworkSnippets(ops: CircuitOp[], numQubits: number): FrameworkSnippets {
  const body = ops.slice().sort((a, b) => a.col - b.col);
  const qiskit = [
    `from qiskit import QuantumCircuit`,
    ``,
    `qc = QuantumCircuit(${numQubits}, ${numQubits})`,
    emit(QISKIT_GATE, body, numQubits),
  ].join("\n");
  const cirq = [
    `import cirq`,
    ``,
    `q = cirq.LineQubit.range(${numQubits})`,
    `circuit = cirq.Circuit(`,
    emit(CIRQ_GATE, body, numQubits).split("\n").map((l) => `    ${l},`).join("\n"),
    `)`,
  ].join("\n");
  const pennylane = [
    `import pennylane as qml`,
    ``,
    `dev = qml.device("default.qubit", wires=${numQubits})`,
    `@qml.qnode(dev)`,
    `def circuit():`,
    emit(PENNYLANE_GATE, body, numQubits).split("\n").map((l) => `    ${l}`).join("\n"),
  ].join("\n");

  return {
    qiskit, cirq, pennylane,
    note: `All three frameworks express the same logical circuit and produce the same ideal results — ideal quantum evolution does not depend on the SDK. In this prototype the numbers you see come from the built-in state-vector simulator; live execution on Qiskit / Cirq / PennyLane backends is marked "Coming Soon".`,
  };
}

// ── Ideal vs noisy simulation ────────────────────────────────────────────────

export interface NoisyOptions {
  /** Depolarizing error probability per gate, and readout error probability. */
  errorRate: number;
  shots: number;
}

const PAULIS: GateType[] = ["X", "Y", "Z"];

/**
 * Sample measurement counts under a simplified *depolarizing* noise model.
 * This is a standard, honestly-labelled mathematical model — not a hardware
 * noise profile. Ideal results are unaffected; this shows the *kind* of
 * deviation real devices introduce.
 */
export function sampleNoisyCounts(ops: CircuitOp[], numQubits: number, opts: NoisyOptions): number[] {
  const counts = new Array(1 << numQubits).fill(0);
  const p = clamp(opts.errorRate, 0, 0.5);
  const sorted = ops.slice().sort((a, b) => a.col - b.col);

  for (let shot = 0; shot < opts.shots; shot++) {
    let state = zeroState(numQubits);
    for (const op of sorted) {
      if (op.gate === "M") continue;
      state = applyOp(state, op);
      // Inject a Pauli error after the gate with probability p (depolarizing).
      if (Math.random() < p) {
        if (op.gate === "CNOT" || op.gate === "SWAP") {
          // Random single-qubit Pauli on either wire (simplified two-qubit error).
          const target = op.qubits[Math.random() < 0.5 ? 0 : 1];
          const pauli = PAULIS[Math.floor(Math.random() * PAULIS.length)];
          state = applyOp(state, { id: "e", gate: pauli, qubits: [target], col: 0 });
        } else {
          const pauli = PAULIS[Math.floor(Math.random() * PAULIS.length)];
          state = applyOp(state, { id: "e", gate: pauli, qubits: op.qubits, col: 0 });
        }
      }
    }
    // Sample the outcome from the (possibly corrupted) state.
    const probs = probabilities(state);
    let r = Math.random();
    let outcome = probs.length - 1;
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r < acc) { outcome = i; break; }
    }
    // Readout error: flip a randomly chosen bit with probability p.
    let idx = outcome;
    for (let q = 0; q < numQubits; q++) {
      if (Math.random() < p) idx ^= 1 << q;
    }
    counts[idx]++;
  }
  return counts;
}

// ── AI challenge generation ──────────────────────────────────────────────────

/** Build a single circuit challenge for a topic + difficulty from the template bank. */
export function generateCircuitChallenge(topicId: TopicId, difficulty: Difficulty): AiChallenge | null {
  // Prefer an exact match, then the nearest difficulty for that topic.
  let tpl = CHALLENGE_TEMPLATES.find((t) => t.topicId === topicId && t.difficulty === difficulty);
  if (!tpl) {
    const forTopic = CHALLENGE_TEMPLATES.filter((t) => t.topicId === topicId);
    if (forTopic.length === 0) return null;
    const want = difficultyIndex(difficulty);
    tpl = forTopic.sort((a, b) => Math.abs(difficultyIndex(a.difficulty) - want) - Math.abs(difficultyIndex(b.difficulty) - want))[0];
  }

  const ops: CircuitOp[] = tpl.reference.map((r, i) => ({
    id: `ref-${i}`, gate: r.gate, qubits: r.qubits, col: i,
  }));
  const expected = runCircuit(ops, tpl.numQubits).probabilities;

  let spec: ChallengeSpec;
  if (tpl.requireEntangled) {
    spec = tpl.numQubits > 2 ? { kind: "ghz", numQubits: tpl.numQubits } : { kind: "entangled-pair" };
  } else {
    spec = { kind: "state-vector-probabilities", expectedProbabilities: expected, tolerance: 0.06 };
  }

  return {
    id: crypto.randomUUID(),
    topicId,
    title: tpl.title,
    prompt: tpl.prompt,
    difficulty: tpl.difficulty,
    requirement: tpl.requirement,
    hints: tpl.hints,
    explanation: tpl.explanation,
    spec,
    numQubits: tpl.numQubits,
    generatedAt: new Date().toISOString(),
  };
}

export interface GenerateContext {
  mastery: { topicId: TopicId; mastery: number; difficulty: Difficulty }[];
  mistakes: { topicId: TopicId; mistakeType: string; frequency: number }[];
  goals: TopicId[];
}

/**
 * Generate a short set of challenges targeting the learner's *weakest* ready
 * topics, biased toward their goal. This is the "AI generates the next
 * personalized challenge" step of the demo.
 */
export function generateChallengesForLearner(ctx: GenerateContext, count = 3): AiChallenge[] {
  const mistakeTopics = new Set(ctx.mistakes.filter((m) => m.frequency >= 2).map((m) => m.topicId));
  const scored = ctx.mastery
    .map((m) => {
      const topicDef = topicById(m.topicId);
      if (!topicDef) return null;
      const hasTemplate = CHALLENGE_TEMPLATES.some((t) => t.topicId === m.topicId);
      if (!hasTemplate) return null;
      let weight = 100 - m.mastery;
      if (mistakeTopics.has(m.topicId)) weight += 35; // prioritise recurring misconceptions
      if (ctx.goals.includes(m.topicId)) weight += 15;
      return { topicId: m.topicId, difficulty: m.difficulty, weight };
    })
    .filter((x): x is { topicId: TopicId; difficulty: Difficulty; weight: number } => x !== null)
    .sort((a, b) => b.weight - a.weight);

  const out: AiChallenge[] = [];
  const seen = new Set<string>();
  for (const s of scored) {
    if (out.length >= count) break;
    const key = `${s.topicId}-${s.difficulty}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ch = generateCircuitChallenge(s.topicId, s.difficulty);
    if (ch) out.push(ch);
  }
  // Fallback so the page is never empty.
  if (out.length === 0) {
    for (const t of CHALLENGE_TEMPLATES.slice(0, count)) {
      const ch = generateCircuitChallenge(t.topicId, t.difficulty);
      if (ch) out.push(ch);
    }
  }
  return out;
}

/** A grounded "what changed?" explanation of a quiz-style mistake. */
export function explainMistake(mistakeType: string, topicId: TopicId): string {
  const q = DIAGNOSTIC.find((d) => d.topicId === topicId && d.mistakeType === mistakeType);
  if (q) return q.explanation;
  const t = topicById(topicId);
  return `This looks like a gap in ${t?.name ?? topicId}. ${t?.blurb ?? ""}`;
}

/** Format a state vector for display. */
export function stateVectorRows(state: Complex[], n: number) {
  const probs = probabilities(state);
  return state.map((amp, i) => ({
    label: ket(i, n),
    amplitude: formatAmplitude(amp),
    probability: probs[i],
  }));
}

export { c, validateSpec };
