import type {
  AchievementDef,
  DailyChallenge,
  LessonDef,
  ModuleDef,
  ResourceItem,
} from "../types";

// ── Modules (the 10-step roadmap) ────────────────────────────────────────────

export const MODULES: ModuleDef[] = [
  { id: "m1", title: "Classical vs Quantum Computing", short: "The Big Shift", icon: "Cpu", duration: "8 min", xp: 50, order: 1 },
  { id: "m2", title: "Qubits", short: "Bits on Steroids", icon: "CircleDot", duration: "8 min", xp: 50, order: 2 },
  { id: "m3", title: "Superposition", short: "Being Two Places at Once", icon: "Waves", duration: "10 min", xp: 60, order: 3 },
  { id: "m4", title: "Measurement", short: "The Quantum Snapshot", icon: "Eye", duration: "8 min", xp: 50, order: 4 },
  { id: "m5", title: "Quantum Gates", short: "The Qubit Toolkit", icon: "Binary", duration: "12 min", xp: 70, order: 5 },
  { id: "m6", title: "Quantum Circuits", short: "Programming with Qubits", icon: "GitBranch", duration: "12 min", xp: 70, order: 6 },
  { id: "m7", title: "Entanglement", short: "Spooky Action", icon: "Link2", duration: "10 min", xp: 60, order: 7 },
  { id: "m8", title: "Quantum Algorithms", short: "Superpowered Solutions", icon: "Brain", duration: "12 min", xp: 70, order: 8 },
  { id: "m9", title: "Quantum Cryptography", short: "Unbreakable Secrets", icon: "Lock", duration: "10 min", xp: 60, order: 9 },
  { id: "m10", title: "Quantum Applications", short: "The Quantum Future", icon: "Rocket", duration: "8 min", xp: 50, order: 10 },
];

// ── Lessons ──────────────────────────────────────────────────────────────────

export const LESSONS: LessonDef[] = [
  {
    id: "l1",
    moduleId: "m1",
    title: "Bits, Logic, and the Quantum Leap",
    summary: "Why today's computers hit a wall, and how quantum computing thinks differently.",
    duration: "8 min",
    xp: 50,
    sections: [
      {
        kind: "text",
        heading: "What is a bit?",
        body: "Every classical computer — laptop, phone, even the smartest supercomputer — is built from bits. A bit is the smallest unit of information, and it can hold exactly one of two values: 0 or 1. That's it. No in-between. A switch is either on or off. A light is either lit or dark. This 'either/or' rule is what makes computers predictable, reliable, and — eventually — limited.",
      },
      { kind: "demo", heading: "See it for yourself", demo: "bit-vs-qubit" },
      {
        kind: "text",
        heading: "The wall classical computers hit",
        body: "Some problems grow incredibly fast as they get bigger. Suppose you need to check 100 combinations of a password: a computer checks them one at a time. Now imagine a problem with 2ⁿ possibilities, where n is the size of the input. At n = 60, that's more possibilities than atoms in the observable universe. No classical computer — present or future — can brute-force its way through problems like that.",
      },
      {
        kind: "example",
        example: {
          title: "The travelling salesperson",
          body: "A salesperson must visit 30 cities using the shortest possible route. With 30 cities there are about 10³¹ possible routes — check one per nanosecond and you'd still be computing long after the universe ends. Quantum computers attack exactly this class of problem: not by checking faster, but by checking in parallel.",
        },
      },
      {
        kind: "text",
        heading: "Where quantum comes in",
        body: "Quantum computers don't just make faster versions of the same tricks. They use a completely different kind of information — qubits — that can hold 0, 1, or a blend of both at once. That single idea unlocks a new style of computation, which you'll meet step by step in this course.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Classical computers process bits that are strictly 0 or 1, one step at a time. Quantum computers process qubits that can represent more than one value at once, enabling a fundamentally different style of computing." },
    ],
    quiz: [
      {
        id: "l1q1",
        lessonId: "l1",
        question: "How many values can a classical bit hold?",
        options: ["One", "Two — 0 or 1", "Two — and any blend of them", "Unlimited"],
        correctIndex: 1,
        explanation: "A bit is strictly 0 or 1 — never a blend. Blending is what qubits do.",
        category: "multiple",
      },
      {
        id: "l1q2",
        lessonId: "l1",
        question: "True or false: quantum computers are simply classical computers that run much faster.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "Quantum computers don't just go faster — they process information in a fundamentally different way using qubits and superposition.",
        category: "truefalse",
      },
      {
        id: "l1q3",
        lessonId: "l1",
        question: "Why do some problems defeat even the fastest classical computers?",
        options: [
          "Because they take too much memory to store",
          "Because the number of possibilities grows exponentially with size",
          "Because computers run out of electricity",
          "Because they were never programmed correctly",
        ],
        correctIndex: 1,
        explanation: "Exponential growth (2ⁿ possibilities) outruns any number of fast steps, since even astronomically fast checking can't visit them all.",
        category: "multiple",
      },
    ],
    keyTakeaway: "Bits are 0 or 1. Qubits can be both. That changes everything.",
  },
  {
    id: "l2",
    moduleId: "m2",
    title: "Qubits — The Quantum Bit",
    summary: "Meet the qubit: information that lives in a state of 'both' until you look at it.",
    duration: "8 min",
    xp: 50,
    sections: [
      {
        kind: "text",
        heading: "From bit to qubit",
        body: "A classical bit can be either 0 or 1. A qubit can exist in a combination of 0 and 1 until it is measured. When you write |0⟩ and |1⟩ (pronounced 'ket zero' and 'ket one'), you're writing the two basic states a qubit can be in. A qubit is never secretly a 0 or a 1 — before measurement it genuinely lives in a blend called a superposition.",
      },
      { kind: "demo", heading: "See a qubit", demo: "qubit-visual" },
      {
        kind: "text",
        heading: "What makes a qubit physical?",
        body: "Real qubits are built from tiny quantum objects: electrons (their spin), photons (their polarization), or superconducting circuits (their energy levels). The details change from machine to machine, but the math is the same everywhere. That's why you can learn quantum computing now, before hardware matures — the ideas transfer.",
      },
      {
        kind: "example",
        example: {
          title: "The spinning coin",
          body: "Imagine a coin spinning on a table. While it spins, it's not heads and it's not tails — it's a blend of both. When you slap your hand down to catch it (measurement), it becomes definitely heads or definitely tails. A qubit in superposition behaves the same way: the blend is real, and catching it forces an answer.",
        },
      },
      {
        kind: "text",
        heading: "Why 'both at once' helps",
        body: "If one qubit can represent 0 and 1 simultaneously, two qubits can represent 00, 01, 10, and 11 at the same time. Every qubit you add doubles the information a computer can juggle at once. Thirty qubits can hold over a billion states simultaneously — that's the source of quantum computing's power.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "A qubit can be |0⟩, |1⟩, or a blend of both. The blend is real — it only becomes a definite 0 or 1 when measured." },
    ],
    quiz: [
      {
        id: "l2q1",
        lessonId: "l2",
        question: "A classical bit can be 0 or 1. A qubit can be…",
        options: [
          "Only 0",
          "Only 1",
          "0, 1, or a combination of both",
          "0, 1, or 2",
        ],
        correctIndex: 2,
        explanation: "Unlike a bit, a qubit can exist in a superposition — a combination of |0⟩ and |1⟩ — until measured.",
        category: "multiple",
      },
      {
        id: "l2q2",
        lessonId: "l2",
        question: "Before measurement, a qubit in superposition is…",
        options: [
          "Secretly either 0 or 1, we just don't know which",
          "Genuinely in a blend of 0 and 1",
          "Always 0",
          "Broken",
        ],
        correctIndex: 1,
        explanation: "Superposition isn't ignorance — the blend is the qubit's actual state until measurement forces a definite answer.",
        category: "multiple",
      },
      {
        id: "l2q3",
        lessonId: "l2",
        question: "How does adding one more qubit change the number of states that can be represented at once?",
        options: ["It adds one", "It doubles it", "It triples it", "It squares it"],
        correctIndex: 1,
        explanation: "Each qubit doubles the state space: 1 qubit → 2 states, 2 qubits → 4, 3 qubits → 8, and so on.",
        category: "probability",
      },
    ],
    keyTakeaway: "Qubits hold |0⟩, |1⟩, or a real blend of both — until measured.",
  },
  {
    id: "l3",
    moduleId: "m3",
    title: "Superposition — Being Two Places at Once",
    summary: "Slide between |0⟩ and |1⟩ and watch a qubit live in both worlds.",
    duration: "10 min",
    xp: 60,
    sections: [
      {
        kind: "text",
        heading: "What is superposition?",
        body: "Superposition is the qubit's superpower: the ability to be a weighted combination of |0⟩ and |1⟩ at the same time. A qubit at 70% |0⟩ and 30% |1⟩ is not 'mostly 0 with a dash of 1' — it's fully in both states, just with different weights. The weights are called amplitudes, and they control the probability you'll see each value when you measure.",
      },
      { kind: "demo", heading: "Try it — slide the probabilities", demo: "superposition-demo" },
      {
        kind: "text",
        heading: "The rules of the game",
        body: "Two rules govern superposition. First: the probabilities always add up to 100%. Second: when you measure, you get exactly one result — 0 or 1 — sampled according to the weights. You can't predict a single measurement, but you can predict the statistics of many.",
      },
      {
        kind: "example",
        example: {
          title: "A loaded coin",
          body: "Imagine a coin weighted so it lands heads 70% of the time. You can't predict any single flip, but flip it 100 times and roughly 70 come up heads. A qubit at 70% |0⟩ behaves the same way: each measurement is random, but the pattern is fixed by the amplitudes.",
        },
      },
      {
        kind: "text",
        heading: "Where superposition breaks down",
        body: "Superposition is fragile. Interaction with the environment — heat, light, stray electromagnetic fields — can collapse or corrupt it. This is called decoherence, and it's the reason quantum computers live inside near-zero-temperature fridges and why error correction is a major research field.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Superposition lets a qubit be a weighted blend of |0⟩ and |1⟩. Measurement samples from that blend — one result, chosen by the probabilities." },
    ],
    quiz: [
      {
        id: "l3q1",
        lessonId: "l3",
        question: "A qubit has a 70% chance of measuring |0⟩ and a 30% chance of measuring |1⟩. You measure it once. What happens?",
        options: [
          "It always measures |0⟩",
          "It measures 0 or 1, with 0 more likely",
          "It measures both 0 and 1",
          "It measures 0.7",
        ],
        correctIndex: 1,
        explanation: "Measurement samples the probability distribution: one outcome, random, with 0 more likely than 1.",
        category: "probability",
      },
      {
        id: "l3q2",
        lessonId: "l3",
        question: "The probabilities of all measurement outcomes of a qubit must always…",
        options: ["Be equal", "Add up to 100%", "Be 50% each", "Add up to 200%"],
        correctIndex: 1,
        explanation: "The squared amplitudes always sum to 1 — probabilities of all outcomes add up to 100%.",
        category: "probability",
      },
      {
        id: "l3q3",
        lessonId: "l3",
        question: "What is decoherence?",
        options: [
          "When a qubit gets faster",
          "When a qubit's superposition is disturbed by its environment",
          "When two qubits are connected",
          "When a qubit is measured twice",
        ],
        correctIndex: 1,
        explanation: "Decoherence is the environment 'leaking' into a qubit, collapsing or corrupting its superposition — a key engineering challenge.",
        category: "multiple",
      },
    ],
    keyTakeaway: "Superposition = a weighted blend of states. Measurement samples it, once.",
  },
  {
    id: "l4",
    moduleId: "m4",
    title: "Measurement — The Quantum Snapshot",
    summary: "Looking at a quantum system forces it to choose. Understand the collapse.",
    duration: "8 min",
    xp: 50,
    sections: [
      {
        kind: "text",
        heading: "The act of looking",
        body: "In classical physics, looking at something doesn't change it. A ball is where it is, whether or not you watch. Quantum measurement is different: the moment you measure a qubit, its superposition collapses into a single definite state. Before the measurement, the possibilities were real. After, one of them was chosen — and the others are gone for good.",
      },
      { kind: "demo", heading: "Watch the collapse", demo: "measurement-demo" },
      {
        kind: "text",
        heading: "What measurement does to the state",
        body: "Measurement has two effects. First, it produces a random outcome sampled from the probability distribution. Second, it destroys the superposition: the qubit now sits in the measured state. Measure a 50/50 qubit and you get |0⟩ or |1⟩; measure it again and you get the same answer, with 100% certainty. This is why quantum information can't be 'peeked at' — looking destroys the very thing you wanted to see.",
      },
      {
        kind: "example",
        example: {
          title: "Schrödinger's cat, minus the drama",
          body: "A qubit in a box is in superposition. When you open the box (measure), you find it in one definite state, and the superposition is gone. The point isn't the cat — it's that for a qubit, 'opening the box' changes reality rather than just revealing it.",
        },
      },
      {
        kind: "text",
        heading: "Why this matters for computing",
        body: "Measurement is the only way to extract an answer from a quantum computer. The art of quantum algorithms is arranging gates so that the answer you want has a high probability of being measured — while unwanted answers are suppressed. That's exactly what you'll explore in the interference lesson and the algorithm explorer.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Measurement collapses superposition into one definite outcome, sampled by probability — and that outcome can't be undone." },
    ],
    quiz: [
      {
        id: "l4q1",
        lessonId: "l4",
        question: "What happens to a qubit's superposition when you measure it?",
        options: [
          "Nothing — it stays the same",
          "It collapses to one definite state",
          "It doubles",
          "It becomes classical",
        ],
        correctIndex: 1,
        explanation: "Measurement collapses the superposition into a single measured outcome, destroying the blend.",
        category: "multiple",
      },
      {
        id: "l4q2",
        lessonId: "l4",
        question: "You measure a 50/50 qubit and get |0⟩. You measure the same qubit again. What happens?",
        options: [
          "50% chance of |0⟩ again",
          "You get |0⟩ with 100% certainty",
          "You get |1⟩",
          "The qubit is destroyed",
        ],
        correctIndex: 1,
        explanation: "After collapse the qubit is definitely |0⟩ — a second measurement finds it unchanged.",
        category: "probability",
      },
      {
        id: "l4q3",
        lessonId: "l4",
        question: "True or false: in quantum computing, observing a computation destroys the answer you were trying to read.",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "Measurement collapses the state, so algorithms must be designed so the desired answer is the likely measurement outcome.",
        category: "truefalse",
      },
    ],
    keyTakeaway: "Measurement = random outcome + destroyed superposition. Algorithms engineer the odds before you look.",
  },
  {
    id: "l5",
    moduleId: "m5",
    title: "Quantum Gates — The Qubit Toolkit",
    summary: "Rotate, flip, and phase-shift qubits with the standard gate set.",
    duration: "12 min",
    xp: 70,
    sections: [
      {
        kind: "text",
        heading: "Gates are operations",
        body: "Classical computers combine bits with logic gates like AND, OR, and NOT. Quantum computers do the same with qubits — but quantum gates are reversible rotations, not irreversible logic. Every quantum gate takes a qubit state and transforms it into another valid qubit state. Nothing is ever copied or deleted; states are rotated in a high-dimensional space.",
      },
      { kind: "demo", heading: "Play with the gates", demo: "gate-playground" },
      {
        kind: "text",
        heading: "The essential gates",
        body: "The X gate flips |0⟩ ↔ |1⟩ — the quantum NOT. The Z gate flips the sign of |1⟩ (a phase flip). The Y gate does both. The Hadamard gate, H, is the star of the show: it takes |0⟩ or |1⟩ and creates a perfect 50/50 superposition. H on |0⟩ gives (|0⟩ + |1⟩)/√2 — the qubit state you'll use more than any other.",
      },
      {
        kind: "example",
        example: {
          title: "H is its own inverse",
          body: "Apply H twice and you get back exactly where you started: H(H|0⟩) = |0⟩. This reversibility is a hallmark of quantum operations. Try it in the playground above — apply H, then H again, and watch the probabilities return to 100% |0⟩.",
        },
      },
      {
        kind: "text",
        heading: "Two-qubit gates",
        body: "Single-qubit gates are powerful, but the magic of quantum computing comes from gates that connect qubits. The CNOT gate flips a target qubit only when a control qubit is |1⟩ — and it's the workhorse for entanglement. You'll meet it properly in the circuits and entanglement lessons.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Quantum gates are reversible rotations. H creates superposition, X flips, Z phases — and CNOT connects two qubits." },
    ],
    quiz: [
      {
        id: "l5q1",
        lessonId: "l5",
        question: "What happens when a qubit in |0⟩ is passed through a Hadamard gate?",
        options: [
          "It remains |0⟩",
          "It becomes |1⟩",
          "It enters an equal superposition of |0⟩ and |1⟩",
          "It gets deleted",
        ],
        correctIndex: 2,
        explanation: "H|0⟩ = (|0⟩ + |1⟩)/√2 — a perfect 50/50 superposition. This is the most important state in quantum computing.",
        category: "circuit",
      },
      {
        id: "l5q2",
        lessonId: "l5",
        question: "The X gate acts like a quantum…",
        options: ["AND gate", "NOT gate", "OR gate", "Copy gate"],
        correctIndex: 1,
        explanation: "X flips |0⟩ ↔ |1⟩, just like a classical NOT — though it works on superposition too.",
        category: "multiple",
      },
      {
        id: "l5q3",
        lessonId: "l5",
        question: "Apply H, then H again, to a qubit starting in |0⟩. What's the final state?",
        options: [
          "50/50 superposition",
          "|1⟩",
          "|0⟩",
          "|0⟩ and |1⟩ entangled",
        ],
        correctIndex: 2,
        explanation: "H is its own inverse: H(H|0⟩) = |0⟩. Two H gates cancel out.",
        category: "circuit",
      },
      {
        id: "l5q4",
        lessonId: "l5",
        question: "What does a CNOT gate do?",
        options: [
          "Flips the target qubit whenever the control is |1⟩",
          "Flips both qubits always",
          "Copies the control qubit",
          "Measures both qubits",
        ],
        correctIndex: 0,
        explanation: "CNOT is controlled-NOT: target flips only when the control is |1⟩. It's essential for entanglement.",
        category: "circuit",
      },
    ],
    keyTakeaway: "H makes superposition, X flips, Z phases, CNOT connects. Learn these four and you can build anything.",
  },
  {
    id: "l6",
    moduleId: "m6",
    title: "Quantum Circuits — Programming with Qubits",
    summary: "Compose gates into circuits and read out answers with measurement.",
    duration: "12 min",
    xp: 70,
    sections: [
      {
        kind: "text",
        heading: "What is a quantum circuit?",
        body: "A quantum circuit is a program for a quantum computer: a sequence of gates applied to qubits, read left to right like sheet music. Each horizontal line is a qubit, each box is a gate, and vertical wires connect gates that involve multiple qubits. At the end, measurement collapses the state and produces your answer.",
      },
      { kind: "demo", heading: "Build the Bell state", demo: "circuit-mini" },
      {
        kind: "text",
        heading: "Reading a circuit",
        body: "Time flows left to right. Gates on the same column act at the same time. Qubits always start in |0⟩ (or a prepared state). The example above builds the famous Bell state: H on q0, then CNOT with q0 controlling q1. The result is a perfect 50/50 blend of |00⟩ and |11⟩ — two qubits that always agree when measured. Congratulations: you just built entanglement.",
      },
      {
        kind: "example",
        example: {
          title: "The two-step recipe for a Bell state",
          body: "Step 1: H on qubit 0 → it's now in superposition. Step 2: CNOT with qubit 0 as control and qubit 1 as target → the target is flipped only in the branch where the control is |1⟩. The result: (|00⟩ + |11⟩)/√2. Measure both qubits and they always match — 00 or 11, never 01 or 10.",
        },
      },
      {
        kind: "text",
        heading: "Where circuits lead",
        body: "Real quantum programs are just bigger circuits: dozens of qubits, thousands of gates, cleverly arranged so that wrong answers cancel out (interference) and right answers reinforce. The Quantum Lab lets you build circuits for real — try the Bell state yourself, then experiment with extra gates and watch the probability distribution change.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Circuits are gate sequences on qubit wires, ending in measurement. H + CNOT = the Bell state = entanglement." },
    ],
    quiz: [
      {
        id: "l6q1",
        lessonId: "l6",
        question: "In a quantum circuit diagram, what does each horizontal line represent?",
        options: ["A gate", "A qubit", "A measurement", "A classical wire"],
        correctIndex: 1,
        explanation: "Each horizontal wire is a qubit; gates are placed on the wires and time flows left to right.",
        category: "circuit",
      },
      {
        id: "l6q2",
        lessonId: "l6",
        question: "The circuit H on q0, then CNOT(q0→q1), starting from |00⟩, produces…",
        options: [
          "|00⟩",
          "A 50/50 mix of |00⟩ and |11⟩",
          "A 50/50 mix of |01⟩ and |10⟩",
          "|11⟩",
        ],
        correctIndex: 1,
        explanation: "H(q0) creates superposition; CNOT flips q1 only when q0 is |1⟩, giving (|00⟩ + |11⟩)/√2 — the Bell state.",
        category: "circuit",
      },
      {
        id: "l6q3",
        lessonId: "l6",
        question: "Measuring both qubits of a Bell state, you will get…",
        options: [
          "Always 00",
          "Always 11",
          "00 or 11, with equal probability",
          "Any of 00, 01, 10, 11",
        ],
        correctIndex: 2,
        explanation: "The Bell state is an equal superposition of |00⟩ and |11⟩ — the two outcomes always agree.",
        category: "probability",
      },
    ],
    keyTakeaway: "Qubits + gates + measurement = circuits. The Bell state is the classic first circuit.",
  },
  {
    id: "l7",
    moduleId: "m7",
    title: "Entanglement — Spooky Action at a Distance",
    summary: "Two qubits that share a fate: measure one, and the other instantly agrees.",
    duration: "10 min",
    xp: 60,
    sections: [
      {
        kind: "text",
        heading: "What is entanglement?",
        body: "Entanglement is a correlation between qubits that is stronger than anything classical. Two entangled qubits don't just happen to match — their states are linked, so measuring one instantly tells you the other, even if they're light-years apart. Einstein called it 'spooky action at a distance'. Quantum experiments have confirmed it is real, and it's the fuel for quantum cryptography and teleportation.",
      },
      { kind: "demo", heading: "Try it — measure the pair", demo: "entanglement-demo" },
      {
        kind: "text",
        heading: "How to create it",
        body: "The recipe is simple: apply H to one qubit, then CNOT from that qubit to a second. The pair is now entangled in the Bell state (|00⟩ + |11⟩)/√2. The qubits don't have a definite value until measured — but when you measure either one, the other is decided too. The outcome is always the same on both sides.",
      },
      {
        kind: "example",
        example: {
          title: "The matching socks",
          body: "Imagine two boxes, each containing one sock, and you know the pair matches. Open one box: you find a left sock, and you instantly know the other box holds a right sock — even before opening it. Entanglement is like this, but stronger: before either box is opened, neither color exists. The boxes decide together, at the moment of measurement, with perfect agreement.",
        },
      },
      {
        kind: "text",
        heading: "Why entanglement matters",
        body: "Entanglement powers quantum teleportation (moving a quantum state without moving the particle), quantum key distribution (detecting any eavesdropper), and most quantum algorithms. It also underlies the quantum advantage: correlated information that no classical system can reproduce.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Entanglement links qubits so measuring one decides the other — the foundation of quantum cryptography and teleportation." },
    ],
    quiz: [
      {
        id: "l7q1",
        lessonId: "l7",
        question: "Two qubits are in the Bell state (|00⟩ + |11⟩)/√2. You measure qubit 0 and get |0⟩. What will qubit 1 measure as?",
        options: ["|1⟩", "|0⟩", "50/50 either way", "Unknown until measured"],
        correctIndex: 1,
        explanation: "In the Bell state the outcomes are always equal: |00⟩ or |11⟩. Measuring |0⟩ forces the partner to |0⟩ too.",
        category: "probability",
      },
      {
        id: "l7q2",
        lessonId: "l7",
        question: "Which circuit creates the Bell state?",
        options: [
          "X on q0, X on q1",
          "H on q0, then CNOT(q0 → q1)",
          "H on q0, then H on q1",
          "CNOT(q0 → q1) alone",
        ],
        correctIndex: 1,
        explanation: "H creates superposition on q0, then CNOT entangles q1 — the standard Bell-state recipe.",
        category: "circuit",
      },
      {
        id: "l7q3",
        lessonId: "l7",
        question: "True or false: before measurement, two entangled qubits have definite but hidden values.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "Entanglement isn't hidden information — the values genuinely don't exist until a measurement decides them, together.",
        category: "truefalse",
      },
    ],
    keyTakeaway: "Entanglement = shared fate. Measure one, the other agrees — instantly, always, anywhere.",
  },
  {
    id: "l8",
    moduleId: "m8",
    title: "Quantum Algorithms — Superpowered Solutions",
    summary: "How superposition and interference combine into algorithms that beat classical ones.",
    duration: "12 min",
    xp: 70,
    sections: [
      {
        kind: "text",
        heading: "What makes an algorithm quantum?",
        body: "A quantum algorithm is a circuit designed to solve a problem faster than any classical algorithm. The recipe has three parts: put qubits into superposition (try all answers at once), apply gates that make wrong answers cancel out and right answers reinforce (interference), then measure to extract the winner. Algorithms like Deutsch-Jozsa, Grover's search, and Shor's factoring each exploit this pattern.",
      },
      { kind: "demo", heading: "See interference work", demo: "interference-demo" },
      {
        kind: "text",
        heading: "The three big ones",
        body: "Grover's search finds a needle in a haystack — searching N items in roughly √N steps instead of N, a quadratic speedup with practical value in databases. Shor's algorithm factors large numbers exponentially faster, threatening classical cryptography and motivating quantum-safe encryption. Deutsch-Jozsa is the simplest proof that quantum computing is fundamentally different: it decides whether a function is constant or balanced with a single evaluation where classical needs many.",
      },
      {
        kind: "example",
        example: {
          title: "The interference trick",
          body: "Imagine two paths to a goal, each with a 'wrong' sign. In superposition, both paths are taken at once — and the wrong signs cancel, leaving only the right path with a big probability. That's why the answer 'pops out' at measurement: quantum interference didn't check the options; it erased the wrong ones.",
        },
      },
      {
        kind: "text",
        heading: "Where to go next",
        body: "Head to the Algorithm Explorer to run simplified versions of Deutsch-Jozsa, Grover's search, and quantum teleportation — each with a real simulation you can re-run.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Quantum algorithms: superposition to explore, interference to amplify the right answer, measurement to read it." },
    ],
    quiz: [
      {
        id: "l8q1",
        lessonId: "l8",
        question: "Which ingredient makes wrong answers cancel in a quantum algorithm?",
        options: ["Measurement", "Interference", "Superposition alone", "Classical logic"],
        correctIndex: 1,
        explanation: "Interference — the constructive/destructive combination of amplitudes — amplifies correct answers and cancels wrong ones.",
        category: "multiple",
      },
      {
        id: "l8q2",
        lessonId: "l8",
        question: "Grover's search algorithm finds an item in a database of N entries in about…",
        options: ["N steps", "√N steps", "N² steps", "One step always"],
        correctIndex: 1,
        explanation: "Grover's quadratic speedup searches N items in roughly √N steps.",
        category: "multiple",
      },
      {
        id: "l8q3",
        lessonId: "l8",
        question: "True or false: quantum algorithms always output the right answer with 100% certainty.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "They output the right answer with high probability — repeated runs and error correction boost certainty.",
        category: "truefalse",
      },
    ],
    keyTakeaway: "Superpose → interfere → measure. That's every quantum algorithm in one line.",
  },
  {
    id: "l9",
    moduleId: "m9",
    title: "Quantum Cryptography — Unbreakable Secrets",
    summary: "Use physics instead of math to send messages no one can intercept.",
    duration: "10 min",
    xp: 60,
    sections: [
      {
        kind: "text",
        heading: "The problem with classical keys",
        body: "Classical encryption scrambles messages with mathematical keys. As long as the key stays secret, the message is safe. But two problems loom: quantum computers will eventually crack today's most common schemes (like RSA, built on hard factoring), and classical key exchange can never prove no one eavesdropped — an attacker can always copy a key silently.",
      },
      { kind: "demo", heading: "Simulate BB84 key exchange", demo: "bb84-demo" },
      {
        kind: "text",
        heading: "Quantum key distribution (QKD)",
        body: "QKD solves both problems with physics. Alice sends qubits to Bob in random states; they compare notes publicly; and because measuring a qubit disturbs it, any eavesdropper (Eve) leaves a trace that Alice and Bob detect. No measurement, no copying — the no-cloning theorem guarantees it. BB84 is the classic protocol: it produces a shared secret key that is provably safe.",
      },
      {
        kind: "example",
        example: {
          title: "The fragile envelope",
          body: "Classical mail: you can steam open an envelope, read the letter, reseal it — and nobody knows. Quantum mail: the letter is a qubit, and reading it destroys or disturbs it. Eve can't peek without breaking the seal, and breaking the seal is detectable. That's the entire trick of quantum cryptography.",
        },
      },
      {
        kind: "text",
        heading: "Beyond keys",
        body: "Quantum cryptography isn't just theory. Fiber networks in several cities already use QKD to protect data, and satellites (like Micius) have demonstrated it across continents. It's the first quantum technology with real, deployed security value — and a great career field to watch.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Quantum key distribution turns 'you can't copy a qubit' into provably secure communication." },
    ],
    quiz: [
      {
        id: "l9q1",
        lessonId: "l9",
        question: "Why can't an eavesdropper silently copy qubits sent between Alice and Bob?",
        options: [
          "Because qubits are encrypted",
          "Because quantum states can't be cloned",
          "Because qubits travel too fast",
          "Because Alice and Bob use passwords",
        ],
        correctIndex: 1,
        explanation: "The no-cloning theorem forbids copying an unknown quantum state — peeking necessarily disturbs it.",
        category: "multiple",
      },
      {
        id: "l9q2",
        lessonId: "l9",
        question: "How do Alice and Bob detect an eavesdropper in BB84?",
        options: [
          "They compare a few of their qubit preparations and measurements",
          "They listen for the eavesdropper",
          "They use longer passwords",
          "They can't detect one",
        ],
        correctIndex: 0,
        explanation: "By publicly comparing a subset of results, they spot the errors an eavesdropper inevitably introduces.",
        category: "multiple",
      },
      {
        id: "l9q3",
        lessonId: "l9",
        question: "True or false: measurement always disturbs a quantum state.",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "Measurement collapses superposition — that disturbance is exactly what makes eavesdropping detectable.",
        category: "truefalse",
      },
    ],
    keyTakeaway: "QKD uses the no-cloning theorem: any eavesdropper disturbs the qubits and gets caught.",
  },
  {
    id: "l10",
    moduleId: "m10",
    title: "Quantum Applications — The Quantum Future",
    summary: "Where quantum computers will actually change the world.",
    duration: "8 min",
    xp: 50,
    sections: [
      {
        kind: "text",
        heading: "From theory to impact",
        body: "Quantum computers won't replace your laptop — they'll tackle specific problems that classical computers fundamentally can't. The current era is NISQ (Noisy Intermediate-Scale Quantum): machines with dozens to hundreds of imperfect qubits, already running experiments that point toward real advantage. The roadmap ahead leads to fault-tolerant machines running Shor, Grover, and simulation at scale.",
      },
      {
        kind: "text",
        heading: "Four fields being transformed",
        body: "Chemistry and materials: simulating molecules exactly, which could design better batteries, drugs, and fertilizers. Optimization: finding better routes, schedules, and portfolios (the travelling salesperson problem). Machine learning: quantum-enhanced training and kernel methods. Cryptography: both breaking old schemes and enabling quantum-safe ones.",
      },
      {
        kind: "example",
        example: {
          title: "The fertilizer problem",
          body: "Producing ammonia for fertilizer consumes about 2% of the world's energy, because the catalyst is too complex to simulate classically. A quantum computer that simulates that catalyst accurately could discover a dramatically better one — a single application with global environmental impact.",
        },
      },
      {
        kind: "text",
        heading: "Your place in the field",
        body: "The quantum workforce is growing fast, and it needs more than physicists: software engineers, chemists, cryptographers, educators, and policymakers all have roles. Today you've built the foundation — qubits, superposition, gates, circuits, entanglement, algorithms, and security. Use the Algorithm Explorer and Quantum Lab to keep going, and check Resources for deeper material.",
      },
      { kind: "takeaway", heading: "Key takeaway", body: "Quantum computing targets specific hard problems — chemistry, optimization, ML, security — with real societal impact." },
    ],
    quiz: [
      {
        id: "l10q1",
        lessonId: "l10",
        question: "Which of these is a realistic early quantum application?",
        options: [
          "Simulating molecules for better drugs and materials",
          "Replacing all laptops",
          "Speeding up every website",
          "Rendering video games",
        ],
        correctIndex: 0,
        explanation: "Molecular simulation is the most anticipated early application — it's classically intractable but naturally quantum.",
        category: "multiple",
      },
      {
        id: "l10q2",
        lessonId: "l10",
        question: "What does NISQ stand for?",
        options: [
          "New Intelligent Super Quantum",
          "Noisy Intermediate-Scale Quantum",
          "Non-Invasive Standard Quantum",
          "Nano Integrated System Quantum",
        ],
        correctIndex: 1,
        explanation: "NISQ describes today's machines: noisy (imperfect) and intermediate-scale (tens to hundreds of qubits).",
        category: "multiple",
      },
      {
        id: "l10q3",
        lessonId: "l10",
        question: "True or false: quantum computers will make everyday laptops obsolete.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "Quantum computers target specific hard problems; classical computers remain best for everyday computing.",
        category: "truefalse",
      },
    ],
    keyTakeaway: "The quantum future is targeted, not total — and it needs people from every field.",
  },
];

// ── Achievements ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-qubit", name: "First Qubit", description: "Complete your first lesson", icon: "CircleDot", xp: 25 },
  { id: "gate-explorer", name: "Gate Explorer", description: "Run 5 experiments in the Quantum Lab", icon: "Binary", xp: 40 },
  { id: "superposition-master", name: "Superposition Master", description: "Complete the Superposition lesson", icon: "Waves", xp: 30 },
  { id: "entanglement-explorer", name: "Entanglement Explorer", description: "Complete the Entanglement lesson", icon: "Link2", xp: 30 },
  { id: "quantum-beginner", name: "Quantum Beginner", description: "Complete 3 lessons", icon: "Sprout", xp: 50 },
  { id: "quantum-explorer", name: "Quantum Explorer", description: "Complete 6 lessons", icon: "Compass", xp: 100 },
  { id: "quantum-ninja", name: "Quantum Ninja", description: "Complete all 10 lessons", icon: "Trophy", xp: 200 },
  { id: "quiz-ace", name: "Quiz Ace", description: "Score 100% on any quiz", icon: "BadgeCheck", xp: 40 },
  { id: "on-a-roll", name: "On a Roll", description: "Reach a 3-day learning streak", icon: "Flame", xp: 30 },
  { id: "challenge-accepted", name: "Challenge Accepted", description: "Complete a Daily Quantum Challenge", icon: "Swords", xp: 40 },
  { id: "curious-mind", name: "Curious Mind", description: "Ask the AI Tutor your first question", icon: "MessageCircleQuestion", xp: 20 },
  { id: "lab-explorer", name: "Lab Explorer", description: "Build your first custom circuit", icon: "FlaskConical", xp: 30 },
];

// ── Daily challenges ─────────────────────────────────────────────────────────

export const CHALLENGES: DailyChallenge[] = [
  {
    id: "ch-superposition",
    title: "Into Superposition",
    description: "Build a circuit that places qubit 0 into an equal superposition of |0⟩ and |1⟩.",
    numQubits: 1,
    targetCircuit: [{ gate: "H", qubits: [0] }],
    xpReward: 50,
    date: "2026-09-06",
  },
  {
    id: "ch-flip",
    title: "The Flip",
    description: "Flip qubit 0 from |0⟩ to |1⟩.",
    numQubits: 1,
    targetCircuit: [{ gate: "X", qubits: [0] }],
    xpReward: 30,
    date: "2026-09-07",
  },
  {
    id: "ch-bell",
    title: "Create a Bell State",
    description: "Entangle qubits 0 and 1: 50% |00⟩, 50% |11⟩.",
    numQubits: 2,
    targetCircuit: [
      { gate: "H", qubits: [0] },
      { gate: "CNOT", qubits: [0, 1] },
    ],
    xpReward: 80,
    date: "2026-09-08",
  },
];

// ── Resources ────────────────────────────────────────────────────────────────

export const RESOURCES: ResourceItem[] = [
  { id: "r1", title: "What is a Qubit? (Beginner's Guide)", type: "Article", category: "Beginner", description: "A friendly walkthrough of qubits, superposition, and measurement with no math required.", url: "https://en.wikipedia.org/wiki/Qubit" },
  { id: "r2", title: "Quantum Computing for Everyone", type: "Book", category: "Beginner", description: "Chris Bernhardt's gentle introduction to quantum computing ideas.", url: "https://mitpress.mit.edu/9780262539531/quantum-computing-for-everyone/" },
  { id: "r3", title: "Quantum Country", type: "Course", category: "Beginner", description: "An interactive memory-optimized course on quantum computing fundamentals.", url: "https://quantum.country" },
  { id: "r4", title: "Linear Algebra for Quantum Computing", type: "Article", category: "Mathematics", description: "The vectors, matrices, and complex numbers you need, explained from scratch.", url: "https://www.3blue1brown.com/topics/linear-algebra" },
  { id: "r5", title: "Quantum Mechanics and Quantum Computation", type: "Course", category: "Physics", description: "UC Berkeley's free edX course covering quantum mechanics for computation.", url: "https://www.edx.org/course/quantum-mechanics-and-quantum-computation" },
  { id: "r6", title: "Qiskit Textbook", type: "Docs", category: "Programming", description: "IBM's free interactive textbook with hands-on coding in Qiskit.", url: "https://learning.quantum.ibm.com/" },
  { id: "r7", title: "The Quantum Circuit Model", type: "Video", category: "Programming", description: "Visual explanations of circuits, gates, and the Bernstein-Vazirani algorithm.", url: "https://www.youtube.com/watch?v=iRaD1JTgq_8" },
  { id: "r8", title: "Grover's Algorithm Explained", type: "Video", category: "Algorithms", description: "A clear visual walkthrough of Grover's search and amplitude amplification.", url: "https://www.youtube.com/watch?v=0Vq9UjRcYEs" },
  { id: "r9", title: "Quantum Algorithm Zoo", type: "Article", category: "Algorithms", description: "The canonical catalog of quantum algorithms and their speedups.", url: "https://quantumalgorithmzoo.org/" },
  { id: "r10", title: "arXiv: Quantum Physics", type: "Article", category: "Research", description: "Preprint server where the latest quantum research appears first.", url: "https://arxiv.org/list/quant-ph/recent" },
  { id: "r11", title: "Quantum Computing Careers", type: "Article", category: "Career", description: "The skills, roles, and paths into the quantum workforce.", url: "https://www.quantum.gov/" },
  { id: "r12", title: "Quantum Country — QKD", type: "Article", category: "Physics", description: "Interactive reading on quantum key distribution and the no-cloning theorem.", url: "https://quantum.country/qkd" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export const lessonById = (id: string): LessonDef | undefined => LESSONS.find((l) => l.id === id);
export const moduleById = (id: string): ModuleDef | undefined => MODULES.find((m) => m.id === id);

/** Ordered lesson ids — completing in this order unlocks the roadmap. */
export const LESSON_ORDER = LESSONS.map((l) => l.id);