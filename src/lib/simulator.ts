// ── Quantum state-vector simulator ───────────────────────────────────────────
// A small but correct simulator: complex amplitudes, single-qubit gates,
// CNOT / SWAP, and projective measurement with sampling.
// State is stored as a vector of 2^n complex amplitudes, index = basis state
// as an integer whose bits are the qubit values (qubit 0 = least significant).

import type { BlochCoords, CircuitOp, Complex, GateType, SimResult } from "../types";

// ── Complex helpers ──────────────────────────────────────────────────────────

export const c = (re: number, im = 0): Complex => ({ re, im });

export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });

export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});

export const cScale = (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s });

export const cConj = (a: Complex): Complex => ({ re: a.re, im: -a.im });

export const cAbs2 = (a: Complex): number => a.re * a.re + a.im * a.im;

export const cRound = (a: Complex, d = 6): Complex => ({
  re: Math.abs(a.re) < 5e-7 ? 0 : Math.round(a.re * 10 ** d) / 10 ** d,
  im: Math.abs(a.im) < 5e-7 ? 0 : Math.round(a.im * 10 ** d) / 10 ** d,
});

export const sqrt2 = Math.sqrt(2);

// ── Gate matrices (as arrays of 4 complex entries [u00,u01,u10,u11]) ────────

export const GATES: Record<GateType, Complex[]> = {
  H: [c(1 / sqrt2), c(1 / sqrt2), c(1 / sqrt2), c(-1 / sqrt2)],
  X: [c(0), c(1), c(1), c(0)],
  Y: [c(0), c(0, -1), c(0, 1), c(0)],
  Z: [c(1), c(0), c(0), c(-1)],
  S: [c(1), c(0), c(0), c(0, 1)],
  T: [c(1), c(0), c(0), c(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))],
  CNOT: [c(1), c(0), c(0), c(1)], // handled specially; matrix unused
  SWAP: [c(1), c(0), c(0), c(1)], // handled specially
  M: [c(1), c(0), c(0), c(1)],    // handled specially
};

// ── State construction ───────────────────────────────────────────────────────

export function zeroState(n: number): Complex[] {
  const s = new Array<Complex>(2 ** n).fill(c(0));
  s[0] = c(1);
  return s;
}

export function basisState(n: number, value: number): Complex[] {
  const s = new Array<Complex>(2 ** n).fill(c(0));
  s[value] = c(1);
  return s;
}

// ── Gate application ─────────────────────────────────────────────────────────

export function applySingleQubit(state: Complex[], gate: Complex[], target: number): Complex[] {
  const out = state.slice();
  const n = state.length;
  for (let i = 0; i < n; i++) {
    const bit = (i >> target) & 1;
    const partner = i ^ (1 << target);
    // |0⟩ row:  out_i = u00·a_i + u01·a_partner
    // |1⟩ row:  out_i = u10·a_partner + u11·a_i
    const amp = state[i];
    const partnerAmp = state[partner];
    if (bit === 0) {
      out[i] = cAdd(cMul(gate[0], amp), cMul(gate[1], partnerAmp));
    } else {
      out[i] = cAdd(cMul(gate[2], partnerAmp), cMul(gate[3], amp));
    }
  }
  return out;
}

/** Apply CNOT: flips target when control is |1⟩. */
export function applyCNOT(state: Complex[], control: number, target: number): Complex[] {
  const out = state.slice();
  for (let i = 0; i < state.length; i++) {
    if (((i >> control) & 1) === 1) {
      out[i ^ (1 << target)] = state[i];
    } else {
      out[i] = state[i];
    }
  }
  return out;
}

/** Apply SWAP: exchanges the values of two qubits. */
export function applySWAP(state: Complex[], a: number, b: number): Complex[] {
  const out = state.slice();
  for (let i = 0; i < state.length; i++) {
    const ba = (i >> a) & 1;
    const bb = (i >> b) & 1;
    if (ba !== bb) {
      out[i ^ (1 << a) ^ (1 << b)] = state[i];
    } else {
      out[i] = state[i];
    }
  }
  return out;
}

/** Apply a gate op to a state. Throws on invalid ops. */
export function applyOp(state: Complex[], op: CircuitOp): Complex[] {
  const n = Math.log2(state.length);
  switch (op.gate) {
    case "M":
      return state; // handled by measurement step
    case "CNOT": {
      const [control, target] = op.qubits;
      if (control === target) throw new Error("CNOT control and target must differ");
      if (control < 0 || control >= n || target < 0 || target >= n) throw new Error("CNOT qubit out of range");
      return applyCNOT(state, control, target);
    }
    case "SWAP": {
      const [a, b] = op.qubits;
      if (a === b) throw new Error("SWAP qubits must differ");
      if (a < 0 || a >= n || b < 0 || b >= n) throw new Error("SWAP qubit out of range");
      return applySWAP(state, a, b);
    }
    default: {
      const [target] = op.qubits;
      if (target < 0 || target >= n) throw new Error(`${op.gate} qubit out of range`);
      return applySingleQubit(state, GATES[op.gate], target);
    }
  }
}

// ── Probabilities & measurement ──────────────────────────────────────────────

export function probabilities(state: Complex[]): number[] {
  const total = state.reduce((s, a) => s + cAbs2(a), 0) || 1;
  return state.map((a) => cAbs2(a) / total);
}

export function measure(state: Complex[]): { outcome: number; collapsed: Complex[] } {
  const probs = probabilities(state);
  const r = Math.random();
  let acc = 0;
  let outcome = state.length - 1;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r < acc) {
      outcome = i;
      break;
    }
  }
  const collapsed = new Array<Complex>(state.length).fill(c(0));
  collapsed[outcome] = c(1);
  return { outcome, collapsed };
}

// ── Circuit execution ────────────────────────────────────────────────────────

export interface RunCircuitResult {
  state: Complex[];
  probabilities: number[];
  measuredBits: (0 | 1)[] | null;
}

/** Execute a list of ops (ordered by column, then insertion order). */
export function runCircuit(ops: CircuitOp[], numQubits: number): RunCircuitResult {
  let state = zeroState(numQubits);
  const sorted = [...ops].sort((a, b) => a.col - b.col);
  let measuredBits: (0 | 1)[] | null = null;

  for (const op of sorted) {
    if (op.gate === "M") {
      const { outcome, collapsed } = measure(state);
      state = collapsed;
      if (measuredBits === null) measuredBits = new Array(numQubits).fill(0) as (0 | 1)[];
      const bit = ((outcome >> op.qubits[0]) & 1) as 0 | 1;
      measuredBits[op.qubits[0]] = bit;
    } else {
      state = applyOp(state, op);
    }
  }

  return { state, probabilities: probabilities(state), measuredBits };
}

// ── Single-qubit helpers (Bloch sphere, ket formatting) ─────────────────────

/** Convert a single-qubit state (alpha, beta) to Bloch coordinates. */
export function toBloch(state: Complex[]): BlochCoords {
  const [alpha, beta] = state;
  const x = 2 * (alpha.re * beta.re + alpha.im * beta.im);
  const y = 2 * (alpha.re * beta.im - alpha.im * beta.re);
  const z = cAbs2(alpha) - cAbs2(beta);
  return { x, y, z };
}

/** Convert Bloch coordinates back to a normalized state (alpha, beta). */
export function fromBloch(b: BlochCoords): Complex[] {
  const r = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
  if (r < 1e-9) return [c(1), c(0)];
  const theta = Math.acos(Math.max(-1, Math.min(1, b.z / r)));
  const phi = Math.atan2(b.y, b.x);
  return [c(Math.cos(theta / 2)), c(Math.sin(theta / 2) * Math.cos(phi), Math.sin(theta / 2) * Math.sin(phi))];
}

const SQRT_PREFIXES: [number, string][] = [
  [1 / sqrt2, "1/√2"],
  [0.5, "1/2"],
];

export function formatAmplitude(a: Complex): string {
  const r = cRound(a);
  const parts: string[] = [];
  if (Math.abs(r.re) > 1e-9) parts.push(formatReal(r.re));
  if (Math.abs(r.im) > 1e-9) parts.push(`${formatReal(r.im)}i`);
  if (parts.length === 0) return "0";
  return parts.join(" + ").replace("+ -", "- ");
}

function formatReal(x: number): string {
  for (const [v, s] of SQRT_PREFIXES) {
    if (Math.abs(Math.abs(x) - v) < 1e-9) return (x < 0 ? "-" : "") + s;
  }
  if (Math.abs(x) === 1) return x < 0 ? "-1" : "1";
  return x.toFixed(3);
}

export function ket(i: number, n: number): string {
  return "|" + i.toString(2).padStart(n, "0") + "⟩";
}

/** Human description of the final state, e.g. "50% |0⟩ + 50% |1⟩". */
export function describeState(state: Complex[], n: number): string {
  const probs = probabilities(state);
  const parts: string[] = [];
  for (let i = 0; i < state.length; i++) {
    const p = probs[i];
    if (p < 1e-6) continue;
    const amp = formatAmplitude(state[i]);
    parts.push(`${amp} ${ket(i, n)}`);
  }
  return parts.join(" + ") || "0";
}

/** Full text description of a state with percentages. */
export function describeStateWithPct(state: Complex[], n: number): string {
  const probs = probabilities(state);
  const parts: string[] = [];
  for (let i = 0; i < state.length; i++) {
    const p = probs[i];
    if (p < 1e-6) continue;
    parts.push(`${ket(i, n)} ${(p * 100).toFixed(0)}%`);
  }
  return parts.join(" · ");
}

// ── Circuit explanation ("What happened?") ───────────────────────────────────

export function explainCircuit(ops: CircuitOp[], numQubits: number): string {
  const sorted = [...ops].sort((a, b) => a.col - b.col);
  const sentences: string[] = [];
  const singleGates: GateType[] = [];

  for (const op of sorted) {
    switch (op.gate) {
      case "H":
        singleGates.push("H");
        sentences.push(`The Hadamard (H) gate on qubit ${op.qubits[0]} placed it into an equal superposition of |0⟩ and |1⟩.`);
        break;
      case "X":
        sentences.push(`The X gate on qubit ${op.qubits[0]} flipped it (|0⟩ ↔ |1⟩).`);
        break;
      case "Y":
        sentences.push(`The Y gate on qubit ${op.qubits[0]} rotated it around the Y axis of the Bloch sphere.`);
        break;
      case "Z":
        sentences.push(`The Z gate on qubit ${op.qubits[0]} applied a phase flip (|1⟩ → −|1⟩).`);
        break;
      case "S":
        sentences.push(`The S gate on qubit ${op.qubits[0]} rotated its phase by 90° (|1⟩ → i|1⟩).`);
        break;
      case "T":
        sentences.push(`The T gate on qubit ${op.qubits[0]} rotated its phase by 45° (|1⟩ → e^(iπ/4)|1⟩).`);
        break;
      case "CNOT": {
        const [ctl, tgt] = op.qubits;
        sentences.push(`The CNOT gate entangled qubit ${ctl} (control) with qubit ${tgt} (target): when the control is |1⟩, the target flips.`);
        break;
      }
      case "SWAP": {
        const [a, b] = op.qubits;
        sentences.push(`The SWAP gate exchanged the states of qubits ${a} and ${b}.`);
        break;
      }
      case "M":
        sentences.push(`Qubit ${op.qubits[0]} was measured, collapsing it to a definite 0 or 1.`);
        break;
    }
  }

  if (ops.length === 0) {
    return "The circuit is empty. Every qubit starts in |0⟩, so measuring now would give 0 for every qubit.";
  }

  const hasMeasure = sorted.some((o) => o.gate === "M");
  const header = hasMeasure
    ? "Your circuit applies " + (singleGates.length ? singleGates.join(", ") + " gates" : "gates") + " and measures the qubits. "
    : "Your circuit applies " + (singleGates.length ? singleGates.join(", ") + " gates" : "gates") + " without measuring. ";
  return header + sentences.join(" ") + (hasMeasure ? " The final measurement is sampled from the probability distribution shown." : " The probability distribution shows what you would see if you measured now.");
}