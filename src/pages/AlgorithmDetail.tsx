import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { BB84Viz } from "../components/viz/BB84Viz";
import { Ket, SimulatedBadge } from "../components/quantum/display";
import { Badge, Button, Card } from "../components/ui";
import { ALGORITHMS, algorithmById } from "../data/algorithms";
import {
  applyOp, applySingleQubit, cScale, cRound, describeStateWithPct, GATES,
  probabilities, runCircuit, zeroState,
} from "../lib/simulator";
import type { CircuitOp, Complex } from "../types";

function StageBars({ state, n, title }: { state: Complex[]; n: number; title: string }) {
  const probs = probabilities(state);
  const signed = (a: Complex) => (a.re < 0 ? "−" : a.im < 0 ? "−i" : a.re > 0 ? "+" : a.im > 0 ? "+i" : "");
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <div className="space-y-1.5">
        {state.map((amp, i) => {
          const p = probs[i];
          if (p < 0.002 && Math.abs(amp.re) < 0.02 && Math.abs(amp.im) < 0.02) return null;
          const neg = amp.re < -1e-9;
          return (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-14 shrink-0 font-mono text-xs text-slate-300"><Ket value={i} n={n} /></span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-white/5">
                <div
                  className={`h-full rounded transition-all duration-500 ${neg ? "bg-rose-500/60" : "bg-gradient-to-r from-qx-violet/70 to-qx-indigo/70"}`}
                  style={{ width: `${Math.max(p * 100, 2)}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-[11px]">
                <span className={neg ? "text-rose-400" : "text-qx-cyan"}>{signed(amp)}</span>{" "}
                <span className="text-slate-400">{(p * 100).toFixed(1)}%</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-xs text-qx-cyan">{describeStateWithPct(state, n)}</p>
    </div>
  );
}

// ── Deutsch-Jozsa ────────────────────────────────────────────────────────────

type DJType = "constant-0" | "constant-1" | "balanced";

function DeutschJozsaSim() {
  const [fnType, setFnType] = useState<DJType>("balanced");
  const [stages, setStages] = useState<Complex[][] | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [resultBits, setResultBits] = useState<number | null>(null);

  const run = () => {
    let s = zeroState(2);
    const f = (x: number) => (fnType === "balanced" ? (x & 1) ^ ((x >> 1) & 1) : fnType === "constant-0" ? 0 : 1);
    s = applySingleQubit(s, GATES.H, 0);
    s = applySingleQubit(s, GATES.H, 1);
    const afterSuper = s.slice();
    // phase oracle
    s = s.map((amp, i) => (f(i) === 1 ? cScale(amp, -1) : amp));
    const afterOracle = s.slice();
    s = applySingleQubit(s, GATES.H, 0);
    s = applySingleQubit(s, GATES.H, 1);
    const final = s.map((a) => cRound(a));
    setStages([afterSuper, afterOracle, final]);

    const probs = probabilities(final);
    let v = 0;
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r < acc) { v = i; break; }
    }
    setResultBits(v);
    setVerdict(v === 0 ? "constant" : "balanced");
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Run it: 2-qubit Deutsch-Jozsa</h3>
        <SimulatedBadge />
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Pick the hidden function, then run. The circuit queries it exactly once — and always answers correctly.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["constant-0", "constant-1", "balanced"] as DJType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFnType(t)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              fnType === t ? "border-qx-violet/60 bg-qx-violet/20 text-qx-violet" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {t === "constant-0" ? "Constant: f(x)=0" : t === "constant-1" ? "Constant: f(x)=1" : "Balanced: parity"}
          </button>
        ))}
        <Button size="sm" onClick={run} className="ml-auto"><Play className="h-4 w-4" /> Run</Button>
      </div>
      {stages && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StageBars state={stages[0]} n={2} title="1 · After H H" />
          <StageBars state={stages[1]} n={2} title="2 · After oracle" />
          <StageBars state={stages[2]} n={2} title="3 · After H H (final)" />
        </div>
      )}
      {verdict && (
        <div className={`mt-4 rounded-xl border p-4 ${verdict === "constant" ? "border-qx-mint/40 bg-qx-mint/10" : "border-qx-cyan/40 bg-qx-cyan/10"}`}>
          <p className="font-semibold text-white">
            Measured <span className="font-mono"><Ket value={resultBits!} n={2} /></span> → the function is{" "}
            <span className={verdict === "constant" ? "text-qx-mint" : "text-qx-cyan"}>{verdict}</span>.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            One function evaluation. A classical computer may need up to three.
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Grover ───────────────────────────────────────────────────────────────────

function GroverSim() {
  const [stages, setStages] = useState<Complex[][] | null>(null);
  const [marked, setMarked] = useState<number | null>(null);
  const [found, setFound] = useState<number | null>(null);

  const run = () => {
    const mark = Math.floor(Math.random() * 4);
    setMarked(mark);
    let s = zeroState(2);
    s = applySingleQubit(s, GATES.H, 0);
    s = applySingleQubit(s, GATES.H, 1);
    const superposed = s.slice();
    // oracle: phase flip the marked item
    s = s.map((amp, i) => (i === mark ? cScale(amp, -1) : amp));
    const afterOracle = s.slice();
    // diffusion: H, flip |00⟩, H
    s = applySingleQubit(s, GATES.H, 0);
    s = applySingleQubit(s, GATES.H, 1);
    s = s.map((amp, i) => (i === 0 ? cScale(amp, -1) : amp));
    s = applySingleQubit(s, GATES.H, 0);
    s = applySingleQubit(s, GATES.H, 1);
    setStages([superposed, afterOracle, s.map((a) => cRound(a))]);
    const probs = probabilities(s);
    let v = 0; let acc = 0; const r = Math.random();
    for (let i = 0; i < probs.length; i++) { acc += probs[i]; if (r < acc) { v = i; break; } }
    setFound(v);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Run it: Grover on 4 items (2 qubits)</h3>
        <SimulatedBadge />
      </div>
      <p className="mt-2 text-sm text-slate-400">
        One item out of four is secretly marked. One oracle call + one diffusion, then measure. Found it in a single iteration.
      </p>
      <div className="mt-4">
        <Button size="sm" onClick={run}><Play className="h-4 w-4" /> Run search</Button>
      </div>
      {stages && (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StageBars state={stages[0]} n={2} title="1 · Equal superposition" />
            <StageBars state={stages[1]} n={2} title={`2 · Oracle flips item ${marked}`} />
            <StageBars state={stages[2]} n={2} title="3 · Diffusion amplifies" />
          </div>
          <div className="mt-4 rounded-xl border border-qx-mint/40 bg-qx-mint/10 p-4">
            <p className="font-semibold text-white">
              Marked item: <span className="font-mono"><Ket value={marked!} n={2} /></span> ·
              Measured: <span className="font-mono"><Ket value={found!} n={2} /></span>
              {marked === found ? <span className="ml-2 text-qx-mint">✓ found</span> : <span className="ml-2 text-rose-400">✗ miss (run again)</span>}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              For 4 items, one iteration gives the marked item with 100% probability. For N items you repeat ~√N times.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

// ── Teleportation ────────────────────────────────────────────────────────────

type InputChoice = "zero" | "one" | "plus";

const INPUTS: Record<InputChoice, Complex[]> = {
  zero: [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  one: [{ re: 0, im: 0 }, { re: 1, im: 0 }],
  plus: [{ re: 1 / Math.sqrt(2), im: 0 }, { re: 1 / Math.sqrt(2), im: 0 }],
};

function TeleportSim() {
  const [choice, setChoice] = useState<InputChoice>("plus");
  const [log, setLog] = useState<{ m1: number; m2: number; received: Complex[]; fidelity: number } | null>(null);

  const run = () => {
    const psi = INPUTS[choice];
    // 3 qubits: q0 = psi, q1 = Alice's half, q2 = Bob's half
    let s: Complex[] = [
      cMul(psi[0], { re: 1, im: 0 }), { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 },
      cMul(psi[1], { re: 1, im: 0 }), { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 },
    ];
    // build Bell pair on q1,q2: H q1, CNOT q1->q2
    const ops: CircuitOp[] = [
      { id: "h1", gate: "H", qubits: [1], col: 0 },
      { id: "c1", gate: "CNOT", qubits: [1, 2], col: 1 },
      { id: "c2", gate: "CNOT", qubits: [0, 1], col: 2 },
      { id: "h0", gate: "H", qubits: [0], col: 3 },
      { id: "m0", gate: "M", qubits: [0], col: 4 },
      { id: "m1", gate: "M", qubits: [1], col: 4 },
    ];
    const res = runCircuit(ops, 3);
    const bits = res.measuredBits!;
    const m1 = bits[0]; // q0
    const m2 = bits[1]; // q1
    let corrected = res.state;
    const corr: CircuitOp[] = [];
    if (m1 === 1) corr.push({ id: "z", gate: "Z", qubits: [2], col: 5 });
    if (m2 === 1) corr.push({ id: "x", gate: "X", qubits: [2], col: 5 });
    for (const op of corr) corrected = applyOp(corrected, op);
    // extract Bob's qubit (q2) from the surviving basis states
    const base = bits[0] + bits[1] * 2;
    const received = [corrected[base], corrected[base + 4]] as Complex[];
    // fidelity |⟨ψ|recv⟩|²
    const o1 = cMul(cConj(psi[0]), received[0]);
    const o2 = cMul(cConj(psi[1]), received[1]);
    const overlap = { re: o1.re + o2.re, im: o1.im + o2.im };
    const fidelity = overlap.re * overlap.re + overlap.im * overlap.im;
    setLog({ m1, m2, received, fidelity: Math.round(fidelity * 1000) / 1000 });
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Run it: teleport a qubit to Bob</h3>
        <SimulatedBadge />
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Choose the unknown state Alice wants to send. The protocol runs the full circuit — entanglement, measurement, and Bob's correction.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {([["zero", "|0⟩"], ["one", "|1⟩"], ["plus", "(|0⟩+|1⟩)/√2"]] as [InputChoice, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setChoice(id)}
            className={`rounded-xl border px-4 py-2 font-mono text-sm font-semibold transition ${
              choice === id ? "border-qx-violet/60 bg-qx-violet/20 text-qx-violet" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
        <Button size="sm" onClick={run} className="ml-auto"><Play className="h-4 w-4" /> Teleport</Button>
      </div>
      {log && (
        <div className="mt-5 rounded-xl border border-qx-mint/40 bg-qx-mint/10 p-4">
          <p className="font-semibold text-white">
            Alice measured <span className="font-mono">q0={log.m1}</span>, <span className="font-mono">q1={log.m2}</span> →
            Bob applied {log.m1 === 0 && log.m2 === 0 ? "nothing" : `${log.m1 === 1 ? "Z " : ""}${log.m2 === 1 ? "X" : ""}`.trim()}.
          </p>
          <p className="mt-2 font-mono text-sm text-qx-cyan">
            Bob's qubit: {describeStateWithPct(log.received, 1)}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Fidelity with the original: <span className="font-mono font-bold text-qx-mint">{(log.fidelity * 100).toFixed(1)}%</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            The original qubit was consumed — quantum teleportation copies nothing.
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Superdense coding ────────────────────────────────────────────────────────

const SD_MAP: { bits: string; op: string; label: string }[] = [
  { bits: "00", op: "I", label: "Bell state Φ⁺" },
  { bits: "01", op: "X", label: "Bell state Ψ⁺" },
  { bits: "10", op: "Z", label: "Bell state Φ⁻" },
  { bits: "11", op: "X·Z", label: "Bell state Ψ⁻" },
];

function SuperdenseSim() {
  const [msg, setMsg] = useState("01");
  const [received, setReceived] = useState<string | null>(null);

  const run = () => {
    const ops: CircuitOp[] = [
      { id: "h", gate: "H", qubits: [0], col: 0 },
      { id: "c", gate: "CNOT", qubits: [0, 1], col: 1 },
    ];
    if (msg[1] === "1") ops.push({ id: "x", gate: "X", qubits: [0], col: 2 });
    if (msg[0] === "1") ops.push({ id: "z", gate: "Z", qubits: [0], col: 3 });
    ops.push({ id: "c2", gate: "CNOT", qubits: [0, 1], col: 4 });
    ops.push({ id: "h2", gate: "H", qubits: [0], col: 5 });
    ops.push({ id: "m0", gate: "M", qubits: [0], col: 6 });
    ops.push({ id: "m1", gate: "M", qubits: [1], col: 6 });
    const res = runCircuit(ops, 2);
    const bits = res.measuredBits!;
    const rec = `${bits[0]}${bits[1]}`;
    setReceived(rec);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Run it: 2 bits in 1 qubit</h3>
        <SimulatedBadge />
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Alice encodes her 2-bit message onto her half of a shared Bell pair, sends one qubit — Bob decodes both bits.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["00", "01", "10", "11"].map((b) => (
          <button
            key={b}
            onClick={() => setMsg(b)}
            className={`rounded-xl border px-4 py-2 font-mono text-sm font-semibold transition ${
              msg === b ? "border-qx-violet/60 bg-qx-violet/20 text-qx-violet" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {b}
          </button>
        ))}
        <Button size="sm" onClick={run} className="ml-auto"><Play className="h-4 w-4" /> Encode & send</Button>
      </div>
      {received !== null && (
        <div className="mt-5 rounded-xl border border-qx-mint/40 bg-qx-mint/10 p-4">
          <p className="font-semibold text-white">
            Alice sent <span className="font-mono">{msg}</span> ({SD_MAP.find((m) => m.bits === msg)?.label}) ·
            Bob received <span className="font-mono text-qx-mint">{received}</span>
            {msg === received ? <span className="ml-2 text-qx-mint">✓ perfect</span> : <span className="ml-2 text-rose-400">✗ mismatch</span>}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Only one qubit travelled. Entanglement carried the second bit.
          </p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SD_MAP.map((m) => (
          <div key={m.bits} className={`rounded-lg border p-2 text-center ${msg === m.bits ? "border-qx-violet/50 bg-qx-violet/10" : "border-white/10 bg-ink-900/60"}`}>
            <p className="font-mono text-sm font-bold text-white">{m.bits}</p>
            <p className="font-mono text-[11px] text-qx-cyan">{m.op}</p>
            <p className="text-[10px] text-slate-500">{m.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AlgorithmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const algo = id ? algorithmById(id) : undefined;

  const sim = useMemo(() => {
    switch (algo?.simId) {
      case "deutsch-jozsa": return <DeutschJozsaSim />;
      case "grover": return <GroverSim />;
      case "teleportation": return <TeleportSim />;
      case "superdense": return <SuperdenseSim />;
      case "bb84": return <BB84Viz />;
      default: return null;
    }
  }, [algo]);

  if (!algo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Algorithm not found</h1>
        <Button className="mt-6" onClick={() => navigate("/algorithms")}><ArrowLeft className="h-4 w-4" /> All algorithms</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/algorithms" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> All algorithms
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="violet">{algo.title}</Badge>
          <Badge color={algo.level === "Beginner" ? "mint" : "amber"}>{algo.level}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{algo.title}</h1>
        <p className="mt-2 text-lg text-slate-400">{algo.tagline}</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-white"><CheckCircle2 className="h-5 w-5 text-qx-rose" /> What problem does it solve?</h2>
          <p className="leading-relaxed text-slate-300">{algo.problem}</p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-2 font-bold text-white">Classical approach</h2>
            <p className="text-sm leading-relaxed text-slate-400">{algo.classical}</p>
          </Card>
          <Card className="p-6">
            <h2 className="mb-2 font-bold text-white">Quantum approach</h2>
            <p className="text-sm leading-relaxed text-slate-400">{algo.quantum}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 font-bold text-white">Circuit</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/70 p-4">
            {algo.circuit}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-bold text-white">Step by step</h2>
          <div className="space-y-4">
            {algo.steps.map((s, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-qx-violet/20 font-mono text-xs font-bold text-qx-violet">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {sim && (
          <div>
            <h2 className="mb-3 font-bold text-white">Run the simulation</h2>
            {sim}
          </div>
        )}

        <Card className="border-qx-cyan/25 bg-qx-cyan/5 p-6">
          <h2 className="mb-2 font-bold text-white">Real-world relevance</h2>
          <p className="text-sm leading-relaxed text-slate-300">{algo.relevance}</p>
        </Card>
      </div>
    </div>
  );
}

function cConj(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}
function cMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}