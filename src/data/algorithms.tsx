import React from "react";

export interface AlgorithmDef {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  level: "Beginner" | "Intermediate";
  problem: string;
  classical: string;
  quantum: string;
  steps: { title: string; body: string }[];
  relevance: string;
  circuit: React.ReactNode;
  simId: string;
}

const wire = { stroke: "rgba(255,255,255,0.25)", strokeWidth: 1.5 } as const;
const HBox = ({ x, y, color = "#8b5cf6" }: { x: number; y: number; color?: string }) => (
  <g>
    <rect x={x} y={y - 12} width={26} height={24} rx={4} fill="rgba(139,92,246,0.25)" stroke={color} />
    <text x={x + 13} y={y + 5} textAnchor="middle" fill="#c4b5fd" fontSize="13" fontFamily="monospace" fontWeight="700">H</text>
  </g>
);
const MBox = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x} y={y - 12} width={24} height={24} rx={4} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" />
    <text x={x + 12} y={y + 5} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="monospace" fontWeight="700">M</text>
  </g>
);
const QLabel = ({ x, y, text, color = "#a78bfa" }: { x: number; y: number; text: string; color?: string }) => (
  <text x={x} y={y + 4} textAnchor="end" fill={color} fontSize="11" fontFamily="monospace">{text}</text>
);

const DeutschesCircuit = (
  <svg viewBox="0 0 300 120" className="w-full">
    <line x1="30" y1="30" x2="290" y2="30" {...wire} />
    <line x1="30" y1="90" x2="290" y2="90" {...wire} />
    <QLabel x={26} y={30} text="q0" />
    <QLabel x={26} y={90} text="q1" color="#67e8f9" />
    <HBox x={50} y={30} />
    <HBox x={50} y={90} />
    <rect x={130} y={18} width={70} height={84} rx={8} fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.4)" strokeDasharray="4 3" />
    <text x={165} y={60} textAnchor="middle" fill="#67e8f9" fontSize="12" fontFamily="monospace">U_f</text>
    <HBox x={230} y={30} />
    <MBox x={260} y={30} />
  </svg>
);

const GroverCircuit = (
  <svg viewBox="0 0 300 120" className="w-full">
    <line x1="30" y1="30" x2="290" y2="30" {...wire} />
    <line x1="30" y1="90" x2="290" y2="90" {...wire} />
    <QLabel x={26} y={30} text="q0" />
    <QLabel x={26} y={90} text="q1" color="#67e8f9" />
    <HBox x={50} y={30} />
    <HBox x={50} y={90} />
    <rect x={110} y={18} width={46} height={84} rx={8} fill="rgba(251,113,133,0.08)" stroke="rgba(251,113,133,0.4)" strokeDasharray="4 3" />
    <text x={133} y={60} textAnchor="middle" fill="#fda4af" fontSize="12" fontFamily="monospace">O</text>
    <rect x={180} y={18} width={46} height={84} rx={8} fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.4)" strokeDasharray="4 3" />
    <text x={203} y={60} textAnchor="middle" fill="#c4b5fd" fontSize="12" fontFamily="monospace">D</text>
    <MBox x={256} y={30} />
    <MBox x={256} y={90} />
  </svg>
);

const TeleportCircuit = (
  <svg viewBox="0 0 300 170" className="w-full">
    <line x1="30" y1="30" x2="290" y2="30" {...wire} />
    <line x1="30" y1="90" x2="290" y2="90" {...wire} />
    <line x1="30" y1="150" x2="290" y2="150" {...wire} />
    <QLabel x={26} y={30} text="q0 (ψ)" color="#fbbf24" />
    <QLabel x={26} y={90} text="q1" color="#67e8f9" />
    <QLabel x={26} y={150} text="q2" color="#67e8f9" />
    <HBox x={70} y={90} />
    <circle cx={130} cy={90} r={4} fill="#e2e8f0" />
    <line x1="130" y1="90" x2="130" y2="150" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    <circle cx="130" cy="150" r="9" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="1.5" />
    <circle cx="170" cy="30" r="4" fill="#e2e8f0" />
    <line x1="170" y1="30" x2="170" y2="90" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    <circle cx="170" cy="90" r="9" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="1.5" />
    <HBox x={205} y={30} />
    <MBox x={245} y={30} />
    <MBox x={245} y={90} />
    <text x="245" y="120" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="monospace">2 classical bits</text>
    <rect x="205" y="138" width="46" height="24" rx="4" fill="rgba(251,113,133,0.15)" stroke="#fb7185" />
    <text x="228" y="154" textAnchor="middle" fill="#fda4af" fontSize="11" fontFamily="monospace" fontWeight="700">X/Z?</text>
  </svg>
);

const SuperdenseCircuit = (
  <svg viewBox="0 0 300 120" className="w-full">
    <line x1="30" y1="30" x2="290" y2="30" {...wire} />
    <line x1="30" y1="90" x2="290" y2="90" {...wire} />
    <QLabel x={26} y={30} text="q0" />
    <QLabel x={26} y={90} text="q1" color="#67e8f9" />
    <HBox x={55} y={30} />
    <circle cx={95} cy={30} r={4} fill="#e2e8f0" />
    <line x1="95" y1="30" x2="95" y2="90" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    <circle cx="95" cy="90" r="9" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="1.5" />
    <rect x="135" y="18" width="46" height="24" rx="4" fill="rgba(251,113,133,0.15)" stroke="#fb7185" />
    <text x="158" y="34" textAnchor="middle" fill="#fda4af" fontSize="11" fontFamily="monospace" fontWeight="700">X/Z</text>
    <circle cx="215" cy="30" r="4" fill="#e2e8f0" />
    <line x1="215" y1="30" x2="215" y2="90" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    <circle cx="215" cy="90" r="9" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="1.5" />
    <HBox x={250} y={90} />
    <MBox x={272} y={30} />
    <MBox x={272} y={90} />
  </svg>
);

export const ALGORITHMS: AlgorithmDef[] = [
  {
    id: "deutsch-jozsa",
    title: "Deutsch-Jozsa",
    tagline: "The simplest proof that quantum is different: one query vs many.",
    icon: "FunctionSquare",
    level: "Intermediate",
    problem:
      "Given a function f that is either constant (always 0 or always 1) or balanced (0 for half the inputs, 1 for the other half), decide which it is. Classically you may need to evaluate f on up to half the inputs plus one. A quantum computer needs exactly ONE evaluation.",
    classical: "Check f(0), f(1), f(2)… until you find both a 0 and a 1, or you've checked half the inputs plus one. In the worst case that's 2ⁿ⁻¹ + 1 evaluations.",
    quantum: "Put all qubits in superposition with H gates, apply the function as a phase oracle (it flips the sign of inputs where f = 1), then apply H again. Interference makes a constant function collapse to |00…0⟩ and a balanced function collapse to anything else.",
    steps: [
      { title: "Superpose", body: "Apply H to every qubit. The register now holds all 2ⁿ inputs at once, each with equal amplitude." },
      { title: "Query the oracle", body: "The oracle flips the phase (sign) of every input x where f(x) = 1. For a constant function all phases stay equal; for a balanced function exactly half get flipped." },
      { title: "Interfere", body: "Apply H again. Equal phases interfere constructively toward |00…0⟩; mixed phases cancel the |00…0⟩ component." },
      { title: "Measure", body: "All zeros ⇒ constant. Anything else ⇒ balanced. One query, guaranteed." },
    ],
    relevance:
      "Deutsch-Jozsa is the historical first demonstration of a provable separation between quantum and classical query complexity — the seed of everything that followed.",
    circuit: DeutschesCircuit,
    simId: "deutsch-jozsa",
  },
  {
    id: "grover",
    title: "Grover's Search",
    tagline: "Find a needle in a haystack in √N steps.",
    icon: "Search",
    level: "Intermediate",
    problem:
      "Search an unsorted list of N items for the one marked item. Classically you check items one by one — N checks in the worst case. Grover's algorithm finds it in roughly √N checks.",
    classical: "Linear scan: test each item until the marked one is found. Expected N/2 checks for a random mark, N in the worst case.",
    quantum: "Start in equal superposition of all items. Apply the oracle (flips the sign of the marked item), then the diffusion operator, which 'reflects about the mean'. Each pair of steps amplifies the marked item's amplitude. After ~√N rounds, measurement finds the mark with high probability.",
    steps: [
      { title: "Superpose all items", body: "H on every qubit gives every item the same amplitude — the haystack, all at once." },
      { title: "Oracle marks the needle", body: "The oracle flips the sign of the marked item only. Nothing is 'looked up'; the mark is a phase." },
      { title: "Diffusion amplifies", body: "The diffusion operator inverts every amplitude about the average. The flipped (negative) mark swings far positive while everything else shrinks." },
      { title: "Measure", body: "After enough rounds the marked item dominates the probabilities. Measure — you found it." },
    ],
    relevance:
      "Quadratic speedups for search apply to databases, constraint satisfaction, and as a subroutine in many other algorithms. It's the most practical speedup to demo on near-term hardware.",
    circuit: GroverCircuit,
    simId: "grover",
  },
  {
    id: "teleportation",
    title: "Quantum Teleportation",
    tagline: "Move a quantum state instantly — using entanglement and two classical bits.",
    icon: "Send",
    level: "Intermediate",
    problem:
      "Alice has an unknown qubit state |ψ⟩ and wants to send it to Bob. She can't copy it (no-cloning theorem) and can't measure it without destroying it. Teleportation moves the state itself using a pre-shared entangled pair.",
    classical: "Impossible: classical communication can describe only a classical bit, and measuring |ψ⟩ destroys it. You'd have to ship the physical qubit.",
    quantum: "Alice and Bob share a Bell pair. Alice entangles her unknown qubit with her half, measures two qubits (2 classical bits), and sends the bits to Bob. Bob applies one of four corrections based on the bits and recovers |ψ⟩ exactly.",
    steps: [
      { title: "Share entanglement", body: "q1 and q2 are prepared in the Bell state (|00⟩ + |11⟩)/√2. Alice holds q1, Bob holds q2." },
      { title: "Alice entangles the unknown qubit", body: "CNOT from q0 (the state to send) to q1, then H on q0." },
      { title: "Alice measures & sends 2 bits", body: "Measuring q0 and q1 yields 00, 01, 10, or 11 — the outcome tells Bob which correction to apply." },
      { title: "Bob corrects", body: "Based on the bits Bob applies nothing, X, Z, or X·Z. His qubit q2 is now exactly the original |ψ⟩. The original was destroyed — nothing was copied." },
    ],
    relevance:
      "The backbone of quantum networks: quantum repeaters, distributed quantum computing, and the quantum internet all rely on teleportation.",
    circuit: TeleportCircuit,
    simId: "teleportation",
  },
  {
    id: "superdense",
    title: "Superdense Coding",
    tagline: "Send 2 classical bits using 1 qubit — with entanglement doing the heavy lifting.",
    icon: "Package",
    level: "Beginner",
    problem:
      "How many classical bits can you send with one qubit? Intuition says one — a qubit collapses to a single bit when measured. With a shared entangled pair, Alice can encode TWO bits into her single qubit.",
    classical: "One qubit measured gives one bit. Without entanglement, 1 qubit = 1 bit, period.",
    quantum: "Alice and Bob share a Bell pair. Alice applies one of four operations (identity, X, Z, or X·Z) to her half — each maps the Bell pair to a different entangled state. She sends her qubit; Bob measures both qubits together and reads which of the four states arrived — two bits of information.",
    steps: [
      { title: "Share a Bell pair", body: "q0 and q1 start entangled: (|00⟩ + |11⟩)/√2." },
      { title: "Alice encodes her 2 bits", body: "00 → do nothing, 01 → X, 10 → Z, 11 → X·Z on her qubit q0. The pair is now one of the four Bell states." },
      { title: "Alice sends one qubit", body: "Only q0 physically travels to Bob. Entanglement carried the rest of the information." },
      { title: "Bob decodes", body: "CNOT q0→q1 then H on q0, then measure both. The 2-bit result is exactly Alice's message." },
    ],
    relevance:
      "The partner of teleportation and a core ingredient of quantum communication protocols and the quantum internet.",
    circuit: SuperdenseCircuit,
    simId: "superdense",
  },
  {
    id: "bb84",
    title: "BB84 Quantum Key Distribution",
    tagline: "Provably secure keys from physics: any eavesdropper gets caught.",
    icon: "KeyRound",
    level: "Beginner",
    problem:
      "Two parties, Alice and Bob, want to agree on a secret key over an insecure channel. Classically they can only rely on computational assumptions (hard math). BB84 uses the no-cloning theorem: measuring a qubit disturbs it, so eavesdropping is detectable.",
    classical: "Diffie-Hellman and RSA rely on problems believed (but not proven) hard — and vulnerable to future quantum computers.",
    quantum: "Alice sends random qubits in random bases. Bob measures in random bases. They publicly compare bases, keep matching positions, and sacrifice a few bits to test for disturbance. Any eavesdropper raises the error rate and gets caught.",
    steps: [
      { title: "Alice sends", body: "For each bit, Alice picks a random basis (Z or X) and sends the corresponding qubit state." },
      { title: "Bob measures", body: "Bob picks a random basis per qubit and measures. Half the time he guesses wrong — those bits are useless." },
      { title: "Sift", body: "They publicly reveal their bases (not the values) and keep only matching positions. That's the sifted key." },
      { title: "Check for Eve", body: "They sacrifice some key bits and compare. If errors appear, someone listened — abort the key. Otherwise it's provably secure." },
    ],
    relevance:
      "The first commercial quantum technology: QKD networks already protect data in several cities, and satellite QKD has worked across continents.",
    circuit: (
      <svg viewBox="0 0 300 90" className="w-full">
        <line x1="30" y1="30" x2="290" y2="30" {...wire} />
        <line x1="30" y1="60" x2="290" y2="60" {...wire} />
        <QLabel x={26} y={30} text="Alice" color="#fbbf24" />
        <QLabel x={26} y={60} text="Bob" color="#67e8f9" />
        <rect x={50} y={12} width={80} height={36} rx={6} fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.4)" />
        <text x={90} y={34} textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace">random basis</text>
        <rect x={150} y={18} width={40} height={24} rx={6} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" />
        <text x={170} y={34} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="monospace">? Eve?</text>
        <rect x={210} y={42} width={70} height={36} rx={6} fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.4)" />
        <text x={245} y={64} textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="monospace">compare bases</text>
      </svg>
    ),
    simId: "bb84",
  },
];

export const algorithmById = (id: string) => ALGORITHMS.find((a) => a.id === id);