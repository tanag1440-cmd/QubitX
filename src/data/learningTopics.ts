import type { Difficulty, GateType, LearningGoal, TopicDef, TopicId } from "../types";

// ── Topic catalog ────────────────────────────────────────────────────────────
// One entry per competency the adaptive engine tracks. `prerequisites` drive
// both prerequisite gating and the recommendation engine.

export const TOPICS: TopicDef[] = [
  // Foundations
  { id: "classical", name: "Classical Computing Basics", category: "Foundations", prerequisites: [], blurb: "Bits, logic, and why classical machines hit a wall.", lessonId: "l1", demoId: "bit-vs-qubit", defaultDifficulty: "Beginner" },
  { id: "qubits", name: "Qubits", category: "Foundations", prerequisites: ["classical"], blurb: "The quantum bit: |0⟩, |1⟩, and blends of both.", lessonId: "l2", demoId: "qubit-visual", defaultDifficulty: "Beginner" },
  { id: "quantum-states", name: "Quantum States", category: "Foundations", prerequisites: ["qubits"], blurb: "Amplitudes, kets, normalization, and the state vector.", lessonId: "l2", defaultDifficulty: "Beginner" },
  { id: "superposition", name: "Superposition", category: "Foundations", prerequisites: ["qubits"], blurb: "Being a weighted blend of |0⟩ and |1⟩ until measured.", lessonId: "l3", demoId: "superposition-demo", defaultDifficulty: "Beginner" },
  { id: "measurement", name: "Measurement", category: "Foundations", prerequisites: ["superposition"], blurb: "Collapse, sampling, and why looking changes the answer.", lessonId: "l4", demoId: "measurement-demo", defaultDifficulty: "Easy" },

  // Gates
  { id: "quantum-gates", name: "Quantum Gates", category: "Gates", prerequisites: ["superposition"], blurb: "Reversible operations as unitary matrices.", lessonId: "l5", demoId: "gate-playground", defaultDifficulty: "Easy" },
  { id: "pauli-x", name: "Pauli-X", category: "Gates", prerequisites: ["quantum-gates"], blurb: "The quantum NOT: flips |0⟩ ↔ |1⟩.", lessonId: "l5", defaultDifficulty: "Easy" },
  { id: "pauli-y", name: "Pauli-Y", category: "Gates", prerequisites: ["pauli-x"], blurb: "A flip combined with a phase — 180° about Y.", lessonId: "l5", defaultDifficulty: "Easy" },
  { id: "pauli-z", name: "Pauli-Z", category: "Gates", prerequisites: ["pauli-x"], blurb: "The phase flip: |1⟩ → −|1⟩.", lessonId: "l5", defaultDifficulty: "Easy" },
  { id: "hadamard", name: "Hadamard (H)", category: "Gates", prerequisites: ["quantum-gates"], blurb: "The superposition maker, and its own inverse.", lessonId: "l5", defaultDifficulty: "Easy" },
  { id: "s-gate", name: "S gate", category: "Gates", prerequisites: ["pauli-z"], blurb: "A 90° phase rotation (√Z).", lessonId: "l5", defaultDifficulty: "Intermediate" },
  { id: "t-gate", name: "T gate", category: "Gates", prerequisites: ["s-gate"], blurb: "A 45° phase rotation (⁴√Z).", lessonId: "l5", defaultDifficulty: "Intermediate" },
  { id: "rotation-gates", name: "Rotation Gates", category: "Gates", prerequisites: ["quantum-gates"], blurb: "Continuous rotations RX, RY, RZ for variational work.", defaultDifficulty: "Advanced" },

  // Multi-qubit
  { id: "cnot", name: "CNOT", category: "Multi-qubit", prerequisites: ["quantum-gates"], blurb: "A conditional flip with a control and a target.", lessonId: "l5", defaultDifficulty: "Intermediate" },
  { id: "controlled-gates", name: "Controlled Gates", category: "Multi-qubit", prerequisites: ["cnot"], blurb: "Conditioning any operation on other qubits.", defaultDifficulty: "Advanced" },
  { id: "entanglement", name: "Entanglement", category: "Multi-qubit", prerequisites: ["cnot", "hadamard"], blurb: "Correlations stronger than any classical link.", lessonId: "l7", demoId: "entanglement-demo", defaultDifficulty: "Intermediate" },
  { id: "bell-states", name: "Bell States", category: "Multi-qubit", prerequisites: ["entanglement"], blurb: "The four maximally entangled two-qubit states.", lessonId: "l7", defaultDifficulty: "Intermediate" },
  { id: "ghz-states", name: "GHZ States", category: "Multi-qubit", prerequisites: ["bell-states"], blurb: "Three-or-more-qubit all-or-nothing entanglement.", defaultDifficulty: "Advanced" },
  { id: "interference", name: "Quantum Interference", category: "Multi-qubit", prerequisites: ["superposition", "hadamard"], blurb: "Amplitudes adding and cancelling — the real engine of speedup.", lessonId: "l6", demoId: "interference-demo", defaultDifficulty: "Advanced" },
  { id: "circuits", name: "Quantum Circuits", category: "Multi-qubit", prerequisites: ["quantum-gates", "measurement"], blurb: "Composing gates into a program, left to right.", lessonId: "l6", demoId: "circuit-mini", defaultDifficulty: "Intermediate" },
  { id: "quantum-teleportation", name: "Quantum Teleportation", category: "Multi-qubit", prerequisites: ["bell-states", "measurement"], blurb: "Moving a state using one Bell pair and two classical bits.", defaultDifficulty: "Advanced" },

  // Algorithms
  { id: "algorithms", name: "Quantum Algorithms", category: "Algorithms", prerequisites: ["circuits", "interference"], blurb: "How circuits are engineered into speedups.", lessonId: "l8", defaultDifficulty: "Advanced" },
  { id: "deutsch-jozsa", name: "Deutsch-Jozsa", category: "Algorithms", prerequisites: ["algorithms", "hadamard"], blurb: "Constant vs balanced in a single query.", defaultDifficulty: "Advanced" },
  { id: "grover", name: "Grover's Algorithm", category: "Algorithms", prerequisites: ["algorithms", "interference"], blurb: "Quadratic search by amplitude amplification.", defaultDifficulty: "Advanced" },
  { id: "shor", name: "Shor's Algorithm", category: "Algorithms", prerequisites: ["algorithms", "interference"], blurb: "Exponential factoring via period finding and the QFT.", defaultDifficulty: "Expert" },

  // Advanced
  { id: "variational", name: "Variational Algorithms", category: "Advanced", prerequisites: ["circuits", "rotation-gates"], blurb: "Parameterized circuits optimized by a classical loop.", defaultDifficulty: "Expert" },
  { id: "qaoa", name: "QAOA", category: "Advanced", prerequisites: ["variational"], blurb: "The quantum approximate optimization algorithm.", defaultDifficulty: "Expert" },
  { id: "qml", name: "Quantum Machine Learning", category: "Advanced", prerequisites: ["variational", "algorithms"], blurb: "Quantum feature maps, kernels, and hybrid models.", defaultDifficulty: "Expert" },
  { id: "noise", name: "Quantum Noise", category: "Advanced", prerequisites: ["quantum-states"], blurb: "Decoherence and decoherence-like errors in real devices.", defaultDifficulty: "Advanced" },
  { id: "error-correction", name: "Quantum Error Concepts", category: "Advanced", prerequisites: ["noise", "entanglement"], blurb: "Encoding, syndromes, and fault tolerance.", defaultDifficulty: "Expert" },
  { id: "frameworks", name: "Quantum Programming Frameworks", category: "Advanced", prerequisites: ["circuits"], blurb: "Qiskit, Cirq, PennyLane, and the shared circuit model.", defaultDifficulty: "Advanced" },
];

export const topicById = (id: TopicId): TopicDef | undefined => TOPICS.find((t) => t.id === id);
export const topicName = (id: TopicId): string => topicById(id)?.name ?? id;

export const TOPIC_CATEGORIES: TopicDef["category"][] = [
  "Foundations", "Gates", "Multi-qubit", "Algorithms", "Advanced",
];

export const GOAL_LABELS: Record<LearningGoal, string> = {
  "from-scratch": "Learn quantum computing from scratch",
  "build-circuits": "Build quantum circuits",
  "exam-prep": "Prepare for exams",
  algorithms: "Learn quantum algorithms",
  "machine-learning": "Learn quantum machine learning",
  programming: "Learn quantum programming",
  research: "Explore quantum research",
};

/** Topics emphasized by each goal — used as one (not the only) signal. */
export const GOAL_TOPIC_WEIGHTS: Record<LearningGoal, TopicId[]> = {
  "from-scratch": ["classical", "qubits", "superposition", "measurement", "quantum-gates", "circuits"],
  "build-circuits": ["quantum-gates", "cnot", "circuits", "bell-states", "entanglement"],
  "exam-prep": ["quantum-gates", "hadamard", "measurement", "circuits", "algorithms"],
  algorithms: ["algorithms", "deutsch-jozsa", "grover", "shor", "interference"],
  "machine-learning": ["qml", "variational", "rotation-gates", "qaoa"],
  programming: ["frameworks", "circuits", "rotation-gates", "variational"],
  research: ["shor", "grover", "error-correction", "noise", "qaoa"],
};

// ── Diagnostic assessment bank ───────────────────────────────────────────────
// Mixed formats: multiple choice, true/false, predict-the-output, gate
// identification, probability, and circuit interpretation. Each wrong option
// carries a `mistakeType` so the engine can log a *specific* misconception
// rather than a generic "wrong".

export type DiagnosticKind = "multiple" | "truefalse" | "predict" | "circuit" | "gate-id" | "probability";

export interface DiagnosticQuestion {
  id: string;
  kind: DiagnosticKind;
  topicId: TopicId;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** What choosing a specific wrong option reveals about the learner. */
  mistakeType?: string;
  /** Optional circuit to render (predict-the-output / circuit interpretation). */
  circuit?: { gate: GateType; qubits: number[] }[];
  numQubits?: number;
}

export const DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: "d1", kind: "truefalse", topicId: "classical",
    prompt: "A classical bit can hold 0 and 1 at the same time.",
    options: ["True", "False"], correctIndex: 1,
    explanation: "A classical bit is strictly 0 or 1 — holding a blend is what a qubit does.",
    mistakeType: "bit-qubit-confusion",
  },
  {
    id: "d2", kind: "multiple", topicId: "qubits",
    prompt: "Which best describes a qubit?",
    options: [
      "Always either 0 or 1, but we don't know which",
      "A state that can be a blend of |0⟩ and |1⟩ until measured",
      "A bit that stores two numbers at once",
      "A very fast classical bit",
    ],
    correctIndex: 1,
    explanation: "A qubit's state is a genuine superposition of |0⟩ and |1⟩; measurement yields 0 or 1 with probabilities set by the amplitudes.",
    mistakeType: "hidden-variable-view",
  },
  {
    id: "d3", kind: "probability", topicId: "superposition",
    prompt: "A qubit is in the state (|0⟩ + |1⟩)/√2. What is the probability of measuring 0?",
    options: ["0%", "25%", "50%", "100%"], correctIndex: 2,
    explanation: "Probability is |amplitude|². The |0⟩ amplitude is 1/√2, so the probability is 1/2 = 50%.",
    mistakeType: "amplitude-as-probability",
  },
  {
    id: "d4", kind: "predict", topicId: "hadamard", numQubits: 1,
    circuit: [{ gate: "H", qubits: [0] }],
    prompt: "The qubit starts in |0⟩. After the circuit above, what do you measure?",
    options: ["Always 0", "Always 1", "0 or 1 with 50% each", "Both 0 and 1 at once"], correctIndex: 2,
    explanation: "H creates an equal superposition, so measurement yields 0 or 1 with equal probability — but a single run gives one definite result.",
    mistakeType: "measurement-ignores-amplitudes",
  },
  {
    id: "d5", kind: "gate-id", topicId: "pauli-x",
    prompt: "Which gate flips |0⟩ to |1⟩ and |1⟩ to |0⟩?",
    options: ["Z", "X", "H", "S"], correctIndex: 1,
    explanation: "X is the quantum NOT gate — a 180° rotation about the X axis.",
    mistakeType: "x-z-confusion",
  },
  {
    id: "d6", kind: "multiple", topicId: "pauli-z",
    prompt: "What does the Z gate do to the state |1⟩?",
    options: ["Flips it to |0⟩", "Adds a −1 phase: |1⟩ → −|1⟩", "Creates superposition", "Nothing at all"],
    correctIndex: 1,
    explanation: "Z leaves |0⟩ alone and multiplies |1⟩ by −1. That invisible phase matters for interference.",
    mistakeType: "phase-blind",
  },
  {
    id: "d7", kind: "probability", topicId: "measurement",
    prompt: "You measure a qubit in an equal superposition and get 1. You measure it again immediately. What do you get?",
    options: ["Always 1 — the state collapsed", "Always 0", "0 or 1 with 50% each", "It is impossible to measure twice"],
    correctIndex: 0,
    explanation: "Measurement collapses the state. A second measurement returns the same outcome with certainty.",
    mistakeType: "measurement-survives-collapse",
  },
  {
    id: "d8", kind: "circuit", topicId: "cnot", numQubits: 2,
    circuit: [{ gate: "CNOT", qubits: [0, 1] }],
    prompt: "Both qubits start in |0⟩. What does the circuit above produce?",
    options: ["|00⟩ with certainty", "|11⟩ with certainty", "An equal mix of all states", "An entangled pair"],
    correctIndex: 0,
    explanation: "CNOT flips the target only when the control is |1⟩. With both qubits at |0⟩, nothing happens: |00⟩.",
    mistakeType: "cnot-control-confusion",
  },
  {
    id: "d9", kind: "predict", topicId: "bell-states", numQubits: 2,
    circuit: [{ gate: "H", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }],
    prompt: "After this circuit, which outcomes are possible when both qubits are measured?",
    options: [
      "All four: |00⟩, |01⟩, |10⟩, |11⟩ equally",
      "Only |00⟩ and |11⟩ — each 50%",
      "Only |01⟩ and |10⟩ — each 50%",
      "Only |11⟩",
    ],
    correctIndex: 1,
    explanation: "This is the Bell state (|00⟩ + |11⟩)/√2: the qubits always agree, so only |00⟩ and |11⟩ occur — 50% each.",
    mistakeType: "bell-state-outcomes",
  },
  {
    id: "d10", kind: "multiple", topicId: "entanglement",
    prompt: "Two qubits are in the Bell state (|00⟩ + |11⟩)/√2. You measure qubit 0 and get 1. What do you know about qubit 1?",
    options: [
      "Nothing — its outcome is independent",
      "It will be 1 too",
      "It will be 0",
      "It is now in superposition",
    ],
    correctIndex: 1,
    explanation: "The outcomes are perfectly correlated: whatever one qubit gives, the other agrees. Measuring one determines the other.",
    mistakeType: "entanglement-as-independence",
  },
  {
    id: "d11", kind: "circuit", topicId: "interference", numQubits: 1,
    circuit: [{ gate: "H", qubits: [0] }, { gate: "H", qubits: [0] }, { gate: "M", qubits: [0] }],
    prompt: "The qubit starts in |0⟩. What does this circuit measure?",
    options: ["Always 0", "Always 1", "50% 0, 50% 1", "It errors out"],
    correctIndex: 0,
    explanation: "H is its own inverse: H·H = identity. The second H cancels the first, so the qubit returns to |0⟩ — a clean example of interference.",
    mistakeType: "interference-missed",
  },
  {
    id: "d12", kind: "multiple", topicId: "grover",
    prompt: "Grover's algorithm searches an unsorted space of N items. Roughly how many steps does it need?",
    options: ["N", "√N", "log N", "N²"], correctIndex: 1,
    explanation: "Grover achieves a quadratic speedup: about √N oracle calls, versus N for the best classical search.",
    mistakeType: "grover-complexity",
  },
  {
    id: "d13", kind: "multiple", topicId: "noise",
    prompt: "Why are real quantum computers error-prone today?",
    options: [
      "Programming languages are not ready",
      "Qubits decohere — they interact with the environment and lose their state",
      "They run too hot",
      "There is no error at all",
    ],
    correctIndex: 1,
    explanation: "Decoherence and gate errors corrupt qubit states, which is why error correction and error mitigation matter so much.",
    mistakeType: "noise-unaware",
  },
];

// ── AI challenge templates ───────────────────────────────────────────────────
// These are the deterministic building blocks the AI challenge generator
// composes per topic + difficulty. Each carries a *behavioral* spec that is
// validated by simulation, so any equivalent circuit is accepted.

export interface ChallengeTemplate {
  topicId: TopicId;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  requirement: string;
  hints: string[];
  explanation: string;
  numQubits: number;
  /** Reference circuit used to compute the expected ideal distribution. */
  reference: { gate: GateType; qubits: number[] }[];
  /** Extra behavioral constraints beyond matching the reference distribution. */
  requireEntangled?: boolean;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    topicId: "superposition", difficulty: "Beginner", numQubits: 1,
    title: "Equal superposition", prompt: "Create a circuit that puts qubit 0 into an equal superposition of |0⟩ and |1⟩.",
    requirement: "Measuring q0 many times should give 0 and 1 about half the time each.",
    hints: ["Which single gate turns a definite |0⟩ into a 50/50 blend?", "Look for the gate nicknamed the 'superposition maker'."],
    explanation: "H|0⟩ = (|0⟩ + |1⟩)/√2, so both outcomes have probability 1/2.",
    reference: [{ gate: "H", qubits: [0] }],
  },
  {
    topicId: "superposition", difficulty: "Easy", numQubits: 2,
    title: "Superpose two qubits", prompt: "Put BOTH qubits into an equal superposition, independently of each other.",
    requirement: "All four basis states should be equally likely — a product of two 50/50 states.",
    hints: ["Apply the same one-qubit gate to each wire.", "Each qubit needs its own H."],
    explanation: "H on both wires gives H|0⟩⊗H|0⟩ — all four outcomes at 25%.",
    reference: [{ gate: "H", qubits: [0] }, { gate: "H", qubits: [1] }],
  },
  {
    topicId: "pauli-x", difficulty: "Beginner", numQubits: 1,
    title: "Flip it", prompt: "Prepare qubit 0 in the state |1⟩.",
    requirement: "Measuring q0 must always give 1.",
    hints: ["Which gate is the quantum NOT?", "One gate is enough."],
    explanation: "X|0⟩ = |1⟩.",
    reference: [{ gate: "X", qubits: [0] }],
  },
  {
    topicId: "hadamard", difficulty: "Easy", numQubits: 1,
    title: "H twice cancels", prompt: "Build a circuit whose measured outcome is ALWAYS 0, using Hadamard gates.",
    requirement: "The final distribution must be 100% |0⟩, using at least two gates.",
    hints: ["H is its own inverse.", "Two H gates on the same wire undo each other."],
    explanation: "H·H = I, so the qubit returns to |0⟩.",
    reference: [{ gate: "H", qubits: [0] }, { gate: "H", qubits: [0] }],
  },
  {
    topicId: "bell-states", difficulty: "Intermediate", numQubits: 2,
    title: "Create a Bell state", prompt: "Entangle qubits 0 and 1 so they always agree when measured.",
    requirement: "Only |00⟩ and |11⟩ should occur, 50% each — and the state must be genuinely entangled.",
    hints: ["Start by putting the control qubit into superposition.", "Then make the second qubit depend on the first."],
    explanation: "(|00⟩ + |11⟩)/√2 — the classic Bell state, built with H then CNOT.",
    reference: [{ gate: "H", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }],
    requireEntangled: true,
  },
  {
    topicId: "entanglement", difficulty: "Intermediate", numQubits: 2,
    title: "Entangle with the target first", prompt: "Create a Bell state where the FIRST qubit is the one that gets flipped conditionally.",
    requirement: "Only |00⟩ and |11⟩ at 50% each, with control on q0.",
    hints: ["Control is the ● dot; target is the ⊕ circle.", "Superpose the control, then CNOT onto the target."],
    explanation: "Both CNOT(H⊗I)|00⟩ and a control-on-q0 arrangement give the same correlations — the engine checks behavior, not gate order.",
    reference: [{ gate: "H", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }],
    requireEntangled: true,
  },
  {
    topicId: "ghz-states", difficulty: "Advanced", numQubits: 3,
    title: "Build a 3-qubit GHZ state", prompt: "Create the GHZ state (|000⟩ + |111⟩)/√2 across three qubits.",
    requirement: "Only |000⟩ and |111⟩ should occur, 50% each — all three qubits correlated.",
    hints: ["Superpose the first qubit.", "Fan out with CNOTs from that first qubit to each of the others."],
    explanation: "H on q0, then CNOT(q0→q1) and CNOT(q0→q2) gives (|000⟩ + |111⟩)/√2.",
    reference: [{ gate: "H", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }, { gate: "CNOT", qubits: [0, 2] }],
    requireEntangled: true,
  },
  {
    topicId: "interference", difficulty: "Advanced", numQubits: 1,
    title: "Demonstrate interference", prompt: "Use interference to make a superposed qubit return to a definite |0⟩.",
    requirement: "Start with H, and end with the distribution 100% |0⟩ using only H gates.",
    hints: ["Interference cancels amplitudes that are out of phase.", "Two H gates in a row cancel."],
    explanation: "The second H recombines the amplitudes: the |1⟩ path cancels, leaving |0⟩ with certainty.",
    reference: [{ gate: "H", qubits: [0] }, { gate: "H", qubits: [0] }],
  },
  {
    topicId: "pauli-z", difficulty: "Intermediate", numQubits: 1,
    title: "Apply a phase flip", prompt: "Prepare a state where |1⟩ carries a −1 phase after starting from |1⟩.",
    requirement: "q0 must measure as 1 with certainty, with a Z gate applied.",
    hints: ["First flip the qubit to |1⟩.", "Then apply the phase flip."],
    explanation: "Z|1⟩ = −|1⟩: the phase is invisible to measurement but real in the state.",
    reference: [{ gate: "X", qubits: [0] }, { gate: "Z", qubits: [0] }],
  },
  {
    topicId: "cnot", difficulty: "Easy", numQubits: 2,
    title: "Conditional flip", prompt: "Flip q1 to |1⟩ ONLY when q0 is |1⟩.",
    requirement: "The circuit must produce |11⟩ with certainty, using a control on q0.",
    hints: ["Set the control to |1⟩ first.", "Then apply the conditional flip."],
    explanation: "X on the control, then CNOT — the target flips only in the |1⟩ branch.",
    reference: [{ gate: "X", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }],
  },
];

export const templatesFor = (topicId: TopicId, difficulty: Difficulty): ChallengeTemplate[] =>
  CHALLENGE_TEMPLATES.filter((t) => t.topicId === topicId && t.difficulty === difficulty);
