// ── Qubit Tutor: mock AI knowledge base ──────────────────────────────────────
// A keyword-matched response engine that never invents facts. Structured so a
// real LLM API can be dropped in later: replace `answerQuery` with an API call.

export interface TutorResponse {
  simple: string;
  example: string;
  deeper: string;
  math: string;
}

interface Topic {
  keywords: string[];
  response: TutorResponse;
  related: string[];
}

const TOPICS: Topic[] = [
  {
    keywords: ["qubit"],
    response: {
      simple: "A qubit is the quantum version of a bit — the smallest unit of quantum information. Where a classical bit is strictly 0 or 1, a qubit can also be in a blend of both at the same time, called superposition, until you measure it.",
      example: "Think of a spinning coin. While it spins it isn't heads or tails — it's a blend of both. Catching it (measuring) forces it to land as one or the other. A qubit is the same idea, made real.",
      deeper: "A qubit's state is a vector α|0⟩ + β|1⟩ with complex amplitudes α and β where |α|² + |β|² = 1. Measuring gives |0⟩ with probability |α|² and |1⟩ with probability |β|². Physically, qubits can be electron spins, photon polarizations, or superconducting circuits.",
      math: "State: |ψ⟩ = α|0⟩ + β|1⟩, α, β ∈ ℂ, |α|² + |β|² = 1. Measurement outcome 0 with p = |α|², outcome 1 with p = |β|².",
    },
    related: ["superposition", "measurement", "bloch sphere"],
  },
  {
    keywords: ["superposition"],
    response: {
      simple: "Superposition is a qubit's ability to be a weighted combination of |0⟩ and |1⟩ at the same time — not 'maybe 0 or maybe 1', but genuinely both, until measured.",
      example: "A 70/30 qubit is like a heavily weighted coin: any single flip is random, but flip it 100 times and roughly 70 come up heads. The weights are real, and they control the odds of each measurement.",
      deeper: "Superposition is a linear combination of basis states. When you measure, the superposition collapses to one outcome sampled from the probabilities. Adding qubits doubles the state space: n qubits in superposition can hold 2ⁿ values at once — the source of quantum parallelism.",
      math: "|ψ⟩ = α|0⟩ + β|1⟩, p(0) = |α|², p(1) = |β|², p(0) + p(1) = 1. n qubits: 2ⁿ basis states.",
    },
    related: ["measurement", "interference", "hadamard"],
  },
  {
    keywords: ["measurement", "measure", "collapse", "collapse"],
    response: {
      simple: "Measurement is the act of reading a qubit. It forces a superposition to collapse into a single definite outcome — 0 or 1 — sampled according to the probabilities. After measurement the superposition is gone.",
      example: "Like catching a spinning coin: while it spins it's a blend, but the catch (measurement) forces heads or tails, and the blend is gone forever.",
      deeper: "Measurement both produces a random outcome and destroys superposition. The same qubit measured again gives the same answer with certainty. This is why quantum algorithms engineer probabilities carefully before the final measurement, and why eavesdroppers in quantum cryptography always leave a trace.",
      math: "Projective measurement on |ψ⟩ = α|0⟩ + β|1⟩: outcome 0 with p = |α|², post-measurement state |0⟩; outcome 1 with p = |β|², state |1⟩.",
    },
    related: ["superposition", "quantum circuits", "qkd"],
  },
  {
    keywords: ["hadamard", "h gate", "hadamard gate"],
    response: {
      simple: "The Hadamard gate (H) is the 'superposition maker'. Applied to |0⟩ or |1⟩, it creates a perfect 50/50 blend of both. It's the most used gate in quantum computing.",
      example: "H turns a coin that's definitely heads (|0⟩) into a spinning coin that lands heads or tails with equal probability. Apply H twice and you're back to a definite heads — H is its own inverse.",
      deeper: "H maps |0⟩ → (|0⟩ + |1⟩)/√2 and |1⟩ → (|0⟩ − |1⟩)/√2. The minus sign matters: it's what enables interference, the cancellation of wrong answers in algorithms like Deutsch-Jozsa.",
      math: "H = (1/√2)[[1, 1], [1, −1]]. H² = I. H|0⟩ = (|0⟩ + |1⟩)/√2; H|1⟩ = (|0⟩ − |1⟩)/√2.",
    },
    related: ["superposition", "interference", "gates"],
  },
  {
    keywords: ["copy", "clone", "no-cloning", "no cloning"],
    response: {
      simple: "You can't copy an unknown quantum state. If a qubit is in some arbitrary superposition, no operation can make a second identical qubit without destroying the original. It's a fundamental theorem, not an engineering limitation.",
      example: "Photocopying a page works because the page's content is classical and observable. A qubit's state isn't observable without collapsing it — so a 'quantum photocopier' would have to know the state, and knowing it destroys it.",
      deeper: "The no-cloning theorem follows from linearity of quantum mechanics: a universal copying map U with U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ for all |ψ⟩ is impossible, because it would have to be linear but the map |ψ⟩ → |ψ⟩|ψ⟩ isn't. This theorem is the backbone of quantum cryptography.",
      math: "Suppose U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ and U|φ⟩|0⟩ = |φ⟩|φ⟩. Linearity gives U(|ψ⟩+|φ⟩)|0⟩ = |ψ⟩|ψ⟩ + |φ⟩|φ⟩, but cloning demands (|ψ⟩+|φ⟩)(|ψ⟩+|φ⟩) — contradiction.",
    },
    related: ["qkd", "entanglement", "measurement"],
  },
  {
    keywords: ["entangl"],
    response: {
      simple: "Entanglement is a connection between qubits stronger than any classical correlation: measure one entangled qubit and the other instantly agrees, even across the universe. Their states are linked as one.",
      example: "Two boxes with matching socks: open one and you instantly know the other — but stronger, because before either is opened neither color exists. They decide together at the moment of measurement, always agreeing.",
      deeper: "The Bell state (|00⟩ + |11⟩)/√2 is created by H on one qubit then CNOT. Outcomes are always equal: |00⟩ or |11⟩, each 50%. This correlation can't be reproduced classically (Bell's theorem), and it powers teleportation and quantum key distribution.",
      math: "Bell state: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Measuring qubit 0 collapses qubit 1 instantly to the same value. Created by CNOT(H⊗I)|00⟩.",
    },
    related: ["teleportation", "qkd", "bell state"],
  },
  {
    keywords: ["grover", "search"],
    response: {
      simple: "Grover's algorithm searches an unsorted database of N items in about √N steps — a quadratic speedup over the N steps a classical computer needs. It amplifies the probability of finding the marked item using interference.",
      example: "Finding a name in an unsorted phone book: classically you check entries one by one. Grover's checks them in superposition, then uses interference to make the correct entry 'louder' until it dominates the measurement.",
      deeper: "Grover applies the oracle (flips the sign of the marked state), then a diffusion operator that inverts about the mean. Repeating √N times rotates the state toward the marked item. Each iteration is an 'amplitude amplification' step.",
      math: "For N items, ~ (π/4)√N oracle calls. Probability of measuring the marked item approaches 1 as iterations approach √N.",
    },
    related: ["algorithms", "interference", "quantum advantage"],
  },
  {
    keywords: ["deutsch", "jozsa", "deutsch-jozsa"],
    response: {
      simple: "Deutsch-Jozsa is the simplest proof that quantum computers are fundamentally different. It decides whether a function is constant (always the same output) or balanced (half 0s, half 1s) using just ONE evaluation — a classical computer may need many.",
      example: "A coin is either 'constant' (both sides same) or 'balanced' (one head, one tail). Classically you might need to look at many flips to be sure. Deutsch-Jozsa checks once and knows.",
      deeper: "The algorithm puts qubits in superposition, applies the function as a quantum oracle, and uses interference so that a constant function cancels to |0⟩ while a balanced one cancels to |1⟩. One measurement settles it.",
      math: "Query complexity: 1 quantum evaluation vs up to 2ⁿ⁻¹ + 1 classical evaluations for n-bit functions.",
    },
    related: ["algorithms", "interference", "hadamard"],
  },
  {
    keywords: ["teleport", "teleportation"],
    response: {
      simple: "Quantum teleportation moves a quantum state from one place to another without moving the particle itself. Alice and Bob share an entangled pair; Alice 'scans' her unknown qubit with it, sends two classical bits, and Bob reconstructs the exact state. The original is destroyed in the process — nothing is copied.",
      example: "Like faxing a blueprint: the blueprint (state) arrives at the destination while the original is consumed. But unlike a fax, the copy is perfect — it's the same state, transferred.",
      deeper: "It uses one Bell pair plus two classical bits. Measurement results on Alice's side (00, 01, 10, or 11) tell Bob which of four corrections to apply. The state is transferred instantly in the sense of correlations, but the classical bits travel at light speed — no faster-than-light communication.",
      math: "Protocol: Bell pair shared, CNOT + H on Alice's side, measure 2 qubits → 2 classical bits → Bob applies I, X, Z, or XZ accordingly.",
    },
    related: ["entanglement", "superdense coding", "qkd"],
  },
  {
    keywords: ["superdense", "dense coding"],
    response: {
      simple: "Superdense coding is the reverse of teleportation: by sharing an entangled pair, Alice can send Bob two classical bits of information while only physically sending ONE qubit. The entanglement does the extra work.",
      example: "You and a friend each hold half of a special pair of items. By manipulating her half in one of four ways and sending it, your friend can learn which of four messages you chose — twice as much information as the item itself would normally carry.",
      deeper: "Alice applies one of four operations (I, X, Z, or XZ) to her half of a Bell pair, then sends it. Bob measures both qubits in the Bell basis and recovers 2 bits. Entanglement provides the channel capacity boost.",
      math: "I, X, Z, XZ map the Bell pair to the four orthogonal Bell states — two bits encoded in one transmitted qubit.",
    },
    related: ["teleportation", "entanglement", "qkd"],
  },
  {
    keywords: ["bb84", "qkd", "key distribution", "cryptography", "quantum key"],
    response: {
      simple: "BB84 is the classic quantum key distribution protocol. Alice sends random qubits to Bob; because measuring a qubit disturbs it, any eavesdropper leaves a detectable trace. Alice and Bob end up with a shared secret key that's provably safe.",
      example: "Quantum mail: the letter is a qubit, and reading it destroys it. Eve can't peek without breaking the seal — and a broken seal is obvious.",
      deeper: "Alice encodes bits in one of two random bases; Bob measures in random bases; they publicly compare bases (not values), keep matching positions, and check a subset for errors. Any eavesdropping increases the error rate, so they abort or use privacy amplification if it's too high.",
      math: "Two bases (Z and X). For matching bases, Bob's bit equals Alice's with certainty. An intercept-and-resend attack introduces a detectable ~25% error rate on the check bits.",
    },
    related: ["measurement", "no-cloning", "teleportation"],
  },
  {
    keywords: ["gate", "gates", "x gate", "z gate", "y gate", "s gate", "t gate"],
    response: {
      simple: "Quantum gates are the operations you apply to qubits — quantum computing's version of logic gates, but reversible. The essentials: X flips |0⟩↔|1⟩, Z flips the sign of |1⟩, H creates superposition, S and T rotate phase, and CNOT connects two qubits.",
      example: "Think of gates as rotations of a knob (the Bloch sphere). X spins the qubit 180° around the X axis, Z spins it 180° around the Z axis, and H is a precise 90° rotation that lands it in a perfect blend.",
      deeper: "Each gate is a unitary matrix: U†U = I, which guarantees reversibility and probability conservation. Single-qubit gates are 2×2 unitaries; CNOT is a 4×4 unitary acting on two qubits.",
      math: "X = [[0,1],[1,0]], Z = [[1,0],[0,−1]], H = (1/√2)[[1,1],[1,−1]], S = [[1,0],[0,i]], CNOT = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]].",
    },
    related: ["hadamard", "quantum circuits", "bloch sphere"],
  },
  {
    keywords: ["circuit", "quantum circuit"],
    response: {
      simple: "A quantum circuit is a program for a quantum computer: qubits as horizontal lines, gates as boxes, time flowing left to right, ending with measurement. Reading it tells you exactly what computation happens.",
      example: "Like sheet music: each line is an instrument (qubit), each symbol is an instruction (gate), and the piece is played left to right. The Bell-state circuit is the 'chopsticks' of quantum computing: H on q0, then CNOT from q0 to q1.",
      deeper: "Circuits are built from unitary gates plus terminal measurements. Every quantum algorithm — Deutsch-Jozsa, Grover, Shor — is a specific circuit. Gates on different qubits commute and can be rearranged; measurement collapses the state, so it's the last step.",
      math: "A circuit implements U = Uₖ⋯U₂U₁ applied to |0...0⟩; the output distribution is p(x) = |⟨x|U|0...0⟩|².",
    },
    related: ["gates", "measurement", "bell state"],
  },
  {
    keywords: ["bell state", "bell"],
    response: {
      simple: "The Bell state is the simplest entangled state: two qubits that always agree when measured — 50% |00⟩ and 50% |11⟩, never |01⟩ or |10⟩. It's the building block of teleportation, superdense coding, and quantum cryptography.",
      example: "Two coins guaranteed to land the same way, even though which way is random. Flip them apart and they still agree — that's entanglement in action.",
      deeper: "Created by H on one qubit then CNOT from it to the other. The four Bell states form an orthonormal basis for two qubits, used for the 'Bell basis' measurement in teleportation.",
      math: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2 = CNOT(H⊗I)|00⟩. Also |Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩ — the four Bell basis vectors.",
    },
    related: ["entanglement", "teleportation", "quantum circuits"],
  },
  {
    keywords: ["interference", "amplitude", "amplification"],
    response: {
      simple: "Quantum interference is how amplitudes add and cancel, like waves. When two paths to the same outcome are in phase they reinforce (constructive), and out of phase they cancel (destructive). Algorithms use it to erase wrong answers and amplify the right one.",
      example: "Two pebbles in a pond: where wave peaks meet, the wave doubles; where a peak meets a trough, the water is flat. Qubit amplitudes do the same — and that's how Grover's search 'finds' the needle.",
      deeper: "Interference requires coherent superposition. In Deutsch-Jozsa the |−⟩ state's sign distinguishes constant vs balanced functions; Grover flips the target's sign then inverts about the mean to amplify it. Without interference, quantum parallelism would be useless — you'd just get noise at measurement.",
      math: "Two paths with amplitudes a and b combine to a + b. Probability |a + b|² ≠ |a|² + |b|² — the cross terms are the interference.",
    },
    related: ["superposition", "grover", "deutsch-jozsa"],
  },
  {
    keywords: ["bloch sphere", "bloch"],
    response: {
      simple: "The Bloch sphere is a 3D picture of a single qubit. North pole is |0⟩, south pole is |1⟩, the equator is superposition, and any point on the surface is a valid qubit state. Gates are rotations of the sphere.",
      example: "A globe for qubits: every direction is a different state. |0⟩ is the North Pole, |1⟩ is the South Pole, and a state like (|0⟩+|1⟩)/√2 sits on the equator. Spin the globe with gates and watch the qubit move.",
      deeper: "A qubit state is a unit vector in 2D complex space, which maps to a point on the unit 2-sphere. The vector (x, y, z) encodes the state's relative phase and probability balance: z = |α|² − |β|².",
      math: "|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ ↔ point (sinθ cosφ, sinθ sinφ, cosθ).",
    },
    related: ["qubit", "gates", "superposition"],
  },
  {
    keywords: ["advantage", "speedup", "power", "why quantum"],
    response: {
      simple: "Quantum computers win on specific problems by exploring many possibilities at once (superposition) and making wrong ones cancel (interference). The big wins: factoring (Shor), search (Grover), and simulating quantum systems.",
      example: "A maze with a billion exits: classical computing tries exits one at a time; a quantum computer walks every path simultaneously, then interference erases dead ends so the real exit is measured.",
      deeper: "The speedups aren't universal — quantum computers are worse or equal for many tasks. The theoretical evidence points to exponential speedup for factoring and simulation, and quadratic for search. Quantum advantage (beating the best classical machine on a real task) has been demonstrated for carefully chosen problems and remains an active research frontier.",
      math: "Shor: factoring n in O((log n)³) vs best classical ~exp(c (log n)^{1/3}). Grover: O(√N) vs O(N).",
    },
    related: ["grover", "deutsch-jozsa", "applications"],
  },
  {
    keywords: ["error", "decoherence", "noise", "nisq"],
    response: {
      simple: "Qubits are fragile: heat, light, and stray fields corrupt their states — that's decoherence and noise. Today's machines (NISQ era) are noisy, so we use error mitigation and are building toward fault-tolerant quantum error correction.",
      example: "Writing in sand: every wave (source of noise) erases a little of your message. Quantum computers correct this by encoding each logical qubit across many physical qubits — redundancy, quantum style.",
      deeper: "Decoherence happens when a qubit interacts with its environment, entangling with it. Quantum error correction encodes one logical qubit into many physical ones and uses syndrome measurements to detect and fix errors without collapsing the computation. Threshold theorems show that with enough good-enough qubits, errors can be pushed arbitrarily low.",
      math: "A qubit's coherence is characterized by T₁ (energy relaxation) and T₂ (dephasing) times. Error correction needs physical error rates below the threshold (~1%).",
    },
    related: ["measurement", "applications", "hardware"],
  },
  {
    keywords: ["shor", "factor"],
    response: {
      simple: "Shor's algorithm factors large numbers exponentially faster than any known classical method — fast enough to break RSA, the encryption protecting much of the internet. It's the algorithm that scared the world into building quantum-safe cryptography.",
      example: "Factoring a 2048-bit number classically would take longer than the age of the universe. Shor's turns factoring into a period-finding problem, which superposition and the quantum Fourier transform solve in minutes on a big-enough quantum computer.",
      deeper: "Shor reduces factoring to finding the period of a modular exponential function, then uses the quantum Fourier transform to extract that period efficiently. This requires thousands of logical qubits, so practical RSA-breaking is still years away — but post-quantum cryptography is being standardized now.",
      math: "Factoring n: find period r of aˣ mod n via QFT. Complexity O((log n)² (log log n)(log log log n)).",
    },
    related: ["cryptography", "algorithms", "applications"],
  },
  {
    keywords: ["hardware", "real quantum", "ibm", "quantum computer", "machine"],
    response: {
      simple: "Real quantum computers exist and are accessible over the cloud (IBM, Google, Rigetti, IonQ). Most are superconducting circuits or trapped ions, kept near absolute zero. Today's machines have tens to hundreds of noisy qubits — enough to learn on, not yet enough for full error correction.",
      example: "Think of early mainframes: real, powerful, and mostly useful to researchers. Cloud access means you can write and run real circuits today — QubitX's simulator prepares you for exactly that.",
      deeper: "Qubit platforms: superconducting (IBM, Google), trapped ions (IonQ, Quantinuum), photonic (Xanadu), neutral atoms (QuEra, Pasqal). Each has tradeoffs in fidelity, connectivity, and speed. Cloud platforms expose quantum services via APIs — the simulator architecture here mirrors that interface, so swapping in a real backend later is straightforward.",
      math: "Machine specs matter via gate error rates (~10⁻³ today), coherence times (T₁, T₂), and qubit connectivity graphs.",
    },
    related: ["nisq", "applications", "career"],
  },
  {
    keywords: ["hello", "hi", "hey", "help", "start", "begin"],
    response: {
      simple: "Hi! I'm Qubit Tutor. Ask me about qubits, superposition, measurement, gates, entanglement, circuits, algorithms like Grover's or Shor's, quantum cryptography, or teleportation. Or use the quick prompts below to see how I explain things.",
      example: "A good first question: 'What is a qubit?' — or 'Explain superposition like I'm 10.'",
      deeper: "If you're brand new, follow the Learn path in order: Classical vs Quantum → Qubits → Superposition → Measurement → Gates → Circuits. Each lesson has hands-on demos.",
      math: "Everything I explain maps to the simulator in the Quantum Lab — try building what I describe!",
    },
    related: ["qubit", "superposition", "hadamard"],
  },
];

const FALLBACK: TutorResponse = {
  simple: "I don't have a confident answer for that yet — and I'd rather not guess about quantum physics. Try asking about qubits, superposition, measurement, gates, entanglement, circuits, Grover's algorithm, teleportation, or BB84.",
  example: "You can also explore hands-on: open the Visualize tab for interactive demos, or build the concept in the Quantum Lab.",
  deeper: "In a production version, this would connect to a curated LLM with retrieval over verified quantum content. For now, my knowledge is limited to the topics I was built with.",
  math: "The Quantum Lab simulator applies the exact mathematics for any circuit you build — run one to see the math in action.",
};

export const QUICK_PROMPTS = [
  "What is a qubit?",
  "Explain superposition like I'm 10.",
  "What does the Hadamard gate do?",
  "Why can't I copy a quantum state?",
  "What is entanglement?",
  "Explain Grover's algorithm.",
];

function normalize(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

// ── Localized core-topic answers ────────────────────────────────────────────
// Language → topic key → localized simple/example. Topics and modes not listed
// here fall back to the English source (the platform-wide fallback rule).
// Technical tokens (|0⟩, H, CNOT, α, β, percentages) pass through untouched.
const KB_LOCALIZED: Record<string, Record<string, { simple: string; example?: string }>> = {
  hi: {
    qubit: {
      simple: "qubit, quantum information की सबसे छोटी इकाई है — यह bit का quantum रूप है। Classical bit सख़्ती से 0 या 1 होता है, जबकि qubit measure किए जाने तक |0⟩ और |1⟩ के मिश्रण (superposition) में रह सकता है।",
      example: "घूमते हुए सिक्के की तरह सोचें। जब तक वह घूम रहा है, वह heads या tails नहीं है — दोनों का मिश्रण है। पकड़ना (measure करना) उसे किसी एक पर आने के लिए मजबूर करता है। qubit भी यही है, बस वास्तविक रूप में।",
    },
    superposition: {
      simple: "Superposition, qubit की यह क्षमता है कि वह एक ही समय पर |0⟩ और |1⟩ का weighted मिश्रण रहे — 'शायद 0 या शायद 1' नहीं, बल्कि measure किए जाने तक वास्तव में दोनों।",
      example: "70/30 का qubit भारी-सिक्के जैसा है: एक बार flip करने पर परिणाम random है, पर 100 बार flip करने पर लगभग 70 बार heads आएगा। weights वास्तविक होती हैं और हर measurement की संभावना तय करती हैं।",
    },
    measurement: {
      simple: "Measurement यानी qubit को पढ़ना। यह superposition को एक निश्चित परिणाम — 0 या 1 — में बदल देता है, जो संभावनाओं के अनुसार आता है। measurement के बाद superposition समाप्त हो जाता है।",
      example: "घूमते सिक्के को पकड़ने जैसा: जब तक घूम रहा है तब तक मिश्रण है, पर पकड़ते ही heads या tails तय हो जाता है — और मिश्रण हमेशा के लिए चला जाता है।",
    },
    hadamard: {
      simple: "Hadamard gate (H) 'superposition बनाने वाला' gate है। |0⟩ या |1⟩ पर लगाने पर यह दोनों का परफेक्ट 50/50 मिश्रण बनाता है। Quantum computing का सबसे अधिक उपयोग होने वाला gate यही है।",
      example: "H, |0⟩ (निश्चित heads) को ऐसे घूमते सिक्के में बदल देता है जो बराबर संभावना से heads या tails देता है। दो बार H लगाने पर वापस निश्चित heads — H अपना ही inverse है।",
    },
    entanglement: {
      simple: "Entanglement, qubits के बीच एक ऐसा संबंध है जो किसी भी classical correlation से मजबूत है: एक entangled qubit को measure करते ही दूसरा तुरंत सहमत हो जाता है — चाहे दोनों कितने भी दूर हों। दोनों की अवस्था एक मानी जाती है।",
      example: "दो सिक्कों को जादुई रूप से जोड़ें: एक को पकड़ते ही heads आए, तो दूसरा भी तुरंत heads ही देगा — हर बार। पर यह जोड़ बनाने के लिए दोनों को पहले एक साथ तैयार करना पड़ता है (H + CNOT)।",
    },
  },
  fr: {
    qubit: {
      simple: "Un qubit est la version quantique du bit — la plus petite unité d'information quantique. Là où un bit classique vaut strictement 0 ou 1, un qubit peut aussi être une combinaison des deux à la fois, appelée superposition, jusqu'à la mesure.",
      example: "Pensez à une pièce qui tourne. Tant qu'elle tourne, elle n'est ni pile ni face — c'est un mélange des deux. L'attraper (mesurer) la force à retomber sur l'un ou l'autre. Un qubit, c'est cette idée rendue réelle.",
    },
    superposition: {
      simple: "La superposition est la capacité d'un qubit à être une combinaison pondérée de |0⟩ et |1⟩ en même temps — pas « peut-être 0 ou peut-être 1 », mais réellement les deux, jusqu'à la mesure.",
      example: "Un qubit 70/30 ressemble à une pièce pondérée : un lancer est aléatoire, mais après 100 lancers, environ 70 donneront pile. Les poids sont réels et contrôlent les probabilités de chaque mesure.",
    },
    measurement: {
      simple: "La mesure, c'est lire un qubit. Elle force la superposition à se réduire à un seul résultat défini — 0 ou 1 — tiré selon les probabilités. Après la mesure, la superposition a disparu.",
      example: "Comme attraper une pièce qui tourne : tant qu'elle tourne c'est un mélange, mais l'attraper force pile ou face, et le mélange disparaît pour toujours.",
    },
    hadamard: {
      simple: "La porte Hadamard (H) est la « fabrique de superposition ». Appliquée à |0⟩ ou |1⟩, elle crée un mélange parfait 50/50 des deux. C'est la porte la plus utilisée en informatique quantique.",
      example: "H transforme une pièce qui est définitivement pile (|0⟩) en une pièce qui tourne et tombe sur pile ou face avec la même probabilité. Appliquez H deux fois et vous revenez à pile — H est son propre inverse.",
    },
    entanglement: {
      simple: "L'intrication est un lien entre qubits plus fort que toute corrélation classique : mesurez un qubit intriqué et l'autre est instantanément d'accord, même à des années-lumière. Leurs états ne font qu'un.",
      example: "Imaginez deux pièces liées magiquement : si la première tombe sur pile, la seconde donne pile aussi — à chaque fois. Mais ce lien doit être préparé ensemble au préalable (H + CNOT).",
    },
  },
  de: {
    qubit: {
      simple: "Ein Qubit ist die Quantenversion eines Bits — die kleinste Einheit der Quanteninformation. Wo ein klassisches Bit strikt 0 oder 1 ist, kann ein Qubit auch eine Kombination aus beiden sein, einer Superposition, bis zur Messung.",
      example: "Denken Sie an eine Münze, die sich dreht. Während sie dreht, ist sie weder Zahl noch Kopf — sie ist eine Mischung aus beiden. Sie zu fangen (messen) zwingt sie zu einem Ergebnis. Ein Qubit ist genau diese Idee, real gemacht.",
    },
    superposition: {
      simple: "Superposition ist die Fähigkeit eines Qubits, eine gewichtete Kombination von |0⟩ und |1⟩ gleichzeitig zu sein — nicht „vielleicht 0 oder vielleicht 1“, sondern wirklich beides, bis zur Messung.",
      example: "Ein 70/30-Qubit ist wie eine beschwerte Münze: Ein einzelner Wurf ist zufällig, aber bei 100 Würfen kommen etwa 70 mal Kopf heraus. Die Gewichte sind real und bestimmen die Wahrscheinlichkeit jeder Messung.",
    },
    measurement: {
      simple: "Messung heißt, ein Qubit zu lesen. Sie zwingt die Superposition, auf ein bestimmtes Ergebnis — 0 oder 1 — zusammenzubrechen, gezogen nach den Wahrscheinlichkeiten. Nach der Messung ist die Superposition weg.",
      example: "Wie eine drehende Münze fangen: Während sie dreht, ist sie eine Mischung, doch der Griff zwingt zu Zahl oder Kopf — und die Mischung ist für immer weg.",
    },
    hadamard: {
      simple: "Das Hadamard-Gatter (H) ist der „Superpositions-Macher“. Auf |0⟩ oder |1⟩ angewendet, erzeugt es eine perfekte 50/50-Mischung beider. Es ist das am häufigsten verwendete Gatter im Quantencomputing.",
      example: "H verwandelt eine Münze, die sicher Kopf ist (|0⟩), in eine drehende Münze, die mit gleicher Wahrscheinlichkeit Kopf oder Zahl zeigt. Zweimal H angewendet — und wieder sicher Kopf. H ist sein eigenes Inverses.",
    },
    entanglement: {
      simple: "Verschränkung ist eine Verbindung zwischen Qubits, stärker als jede klassische Korrelation: Misst man ein verschränktes Qubit, stimmt das andere augenblicklich überein — egal wie weit entfernt. Ihre Zustände sind eins.",
      example: "Zwei magisch verbundene Münzen: Fällt die eine auf Kopf, zeigt auch die andere sofort Kopf — jedes Mal. Dieser Link muss zuvor gemeinsam hergestellt werden (H + CNOT).",
    },
  },
};

/** Score a topic against a query by keyword overlap. */
function scoreTopic(topic: Topic, words: string[]): number {
  let score = 0;
  for (const kw of topic.keywords) {
    const kwWords = kw.split(" ");
    // phrase match (e.g. "hadamard gate")
    if (kwWords.length > 1 && kwWords.every((w) => words.includes(w))) score += 3;
    // single keyword match
    if (kwWords.length === 1 && words.includes(kw)) score += 2;
    // substring match
    for (const w of words) {
      if (w.length > 3 && kw.includes(w)) score += 1;
    }
  }
  return score;
}

const MODE_KEYWORDS: Record<string, string[]> = {
  "simply": ["simply", "simple", "basic", "easy", "dumb", "10", "ten", "beginner", "plain", "short"],
  "analogy": ["analogy", "metaphor", "compare", "like", "example", "real world", "intuitive"],
  "math": ["math", "mathematical", "formula", "equation", "matrix", "technically", "exact"],
  "deeper": ["deeper", "detail", "more", "advanced", "in-depth", "further", "explain"],
};

export type TutorMode = "simple" | "analogy" | "math" | "deeper";

/** Answer a question with the requested style. `lang` localizes core topics. */
export function answerQuery(rawQuery: string, mode: TutorMode = "simple", lang = "en"): TutorResponse {
  const q = normalize(rawQuery);
  const words = q.split(" ").filter((w) => w.length > 1);
  const fullText = rawQuery.toLowerCase();

  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const s = scoreTopic(topic, words);
    if (s > bestScore) {
      bestScore = s;
      best = topic;
    }
  }

  if (!best || bestScore === 0) return FALLBACK;

  const r = best.response;
  const wantMode = (Object.keys(MODE_KEYWORDS) as TutorMode[]).find((m) =>
    MODE_KEYWORDS[m].some((k) => fullText.includes(k) && m !== "deeper")
  );

  const effectiveMode = wantMode ?? mode;
  if (effectiveMode === "math") return { ...r, simple: r.math };
  if (effectiveMode === "deeper") return { ...r, simple: r.deeper };
  if (effectiveMode === "analogy") {
    // Analogy mode stays English unless a localized example exists.
    const loc = KB_LOCALIZED[lang]?.[bestTopicKey(best)];
    if (loc?.example) return { ...r, simple: loc.example };
    return { ...r, simple: r.example };
  }
  // simple mode: localized answer when available, English otherwise.
  const loc = KB_LOCALIZED[lang]?.[bestTopicKey(best)];
  if (loc?.simple) return { ...r, simple: loc.simple };
  return r;
}

/** Stable key for a matched topic, aligned with KB_LOCALIZED entries. */
function bestTopicKey(t: Topic): string {
  return t.keywords[0];
}

/** Topics the user might want to explore next, from the best match. */
export function relatedTopics(rawQuery: string): string[] {
  const words = normalize(rawQuery).split(" ").filter((w) => w.length > 1);
  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const s = scoreTopic(topic, words);
    if (s > bestScore) {
      bestScore = s;
      best = topic;
    }
  }
  return best ? best.related : ["qubit", "superposition", "measurement"];
}