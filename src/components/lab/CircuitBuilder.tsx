import React, { useEffect, useMemo, useState } from "react";
import { Eraser, Minus, Play, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  explainCircuit, ket, probabilities, runCircuit,
} from "../../lib/simulator";
import type { ChallengeSpec, CircuitOp, GateType, TopicId } from "../../types";
import { CircuitAiPanel } from "./CircuitAiPanel";
import { SimulatedBadge } from "../quantum/display";
import { Button, Card } from "../ui";
import { useStore } from "../../lib/store";

const PALETTE: { gate: GateType; label: string; hint: string }[] = [
  { gate: "H", label: "H", hint: "Superposition" },
  { gate: "X", label: "X", hint: "Flip" },
  { gate: "Y", label: "Y", hint: "Y rotation" },
  { gate: "Z", label: "Z", hint: "Phase flip" },
  { gate: "S", label: "S", hint: "90° phase" },
  { gate: "T", label: "T", hint: "45° phase" },
  { gate: "CNOT", label: "⊕", hint: "2-qubit" },
  { gate: "SWAP", label: "⇄", hint: "2-qubit" },
  { gate: "M", label: "M", hint: "Measure" },
];

const PRESETS: { name: string; qubits: number; ops: CircuitOp[] }[] = [
  { name: "— Presets —", qubits: 2, ops: [] },
  {
    name: "Superposition", qubits: 1,
    ops: [op("H", [0], 0)],
  },
  {
    name: "Bell state", qubits: 2,
    ops: [op("H", [0], 0), op("CNOT", [0, 1], 1)],
  },
  {
    name: "GHZ state", qubits: 3,
    ops: [op("H", [0], 0), op("CNOT", [0, 1], 1), op("CNOT", [0, 2], 2)],
  },
  {
    name: "H · H = identity", qubits: 1,
    ops: [op("H", [0], 0), op("H", [0], 1)],
  },
  {
    name: "Entangle + measure", qubits: 2,
    ops: [op("H", [0], 0), op("CNOT", [0, 1], 1), op("M", [0], 2), op("M", [1], 2)],
  },
];

function op(gate: GateType, qubits: number[], col: number): CircuitOp {
  return { id: crypto.randomUUID(), gate, qubits, col };
}

const MAX_COLS = 8;
const COL_W = 56;
const ROW_H = 64;
/** Horizontal space reserved for the q0/q1 wire labels, so column-0 gates never overlap them. */
const LABEL_W = 32;

interface Props {
  maxQubits?: number;
  initialOps?: CircuitOp[];
  initialQubits?: number;
  embedded?: boolean;
  onSave?: (ops: CircuitOp[], numQubits: number, summary: string) => void;
  onRun?: (ops: CircuitOp[], numQubits: number) => void;
  evaluator?: (ops: CircuitOp[], numQubits: number) => { pass: boolean; message: string } | null;
  evaluatorLabel?: string;
  /**
   * Publish the circuit as it changes (additive, optional). Used by the tutor
   * copilot so it can reason about the circuit the learner is *currently*
   * building, including unsaved and half-finished ones.
   */
  onCircuitChange?: (ops: CircuitOp[], numQubits: number) => void;
  /** Opt-in circuit-aware AI tools (Explain / Debug / Frameworks / Noise). */
  showAiTools?: boolean;
  aiTopicId?: TopicId;
  aiSpec?: ChallengeSpec;
}

export function CircuitBuilder({ maxQubits = 4, initialOps, initialQubits = 2, embedded, onSave, onRun, evaluator, evaluatorLabel, onCircuitChange, showAiTools, aiTopicId, aiSpec }: Props) {
  const { currentUser, addExperiment, recordActivity } = useStore();
  const [qubits, setQubits] = useState(Math.min(initialQubits, maxQubits));
  const [ops, setOps] = useState<CircuitOp[]>(initialOps ?? []);
  const [armed, setArmed] = useState<GateType | null>(null);
  const [results, setResults] = useState<ReturnType<typeof runCircuit> | null>(null);
  const [idealProbs, setIdealProbs] = useState<number[] | null>(null);
  const [shots, setShots] = useState<number[] | null>(null);
  const [running, setRunning] = useState(false);
  const [expName, setExpName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxCol = useMemo(() => ops.reduce((m, o) => Math.max(m, o.col), -1), [ops]);

  // Let the host page (and through it the tutor copilot) see the live circuit.
  useEffect(() => {
    onCircuitChange?.(ops, qubits);
  }, [ops, qubits, onCircuitChange]);

  const selectGate = (g: GateType) => {
    setArmed((cur) => (cur === g ? null : g));
  };

  const place = (qubit: number, col: number) => {
    if (!armed) return;
    setError(null);
    if (armed === "CNOT" || armed === "SWAP") {
      // control/partner goes on the armed qubit, other end on the next qubit down
      const other = qubit + 1;
      if (other >= qubits) {
        setError(`${armed} needs two different qubits — add more qubits first.`);
        return;
      }
      const existing = ops.some((o) => o.col === col && (o.qubits.includes(qubit) || o.qubits.includes(other)));
      if (existing) {
        setError("That column already has a gate on one of these qubits.");
        return;
      }
      setOps((o) => [...o, op(armed, armed === "CNOT" ? [qubit, other] : [qubit, other], col)]);
    } else {
      const existing = ops.some((o) => o.col === col && o.qubits.includes(qubit));
      if (existing) {
        setError("That cell already has a gate. Click the gate to remove it first.");
        return;
      }
      setOps((o) => [...o, op(armed, [qubit], col)]);
    }
    setArmed(null);
  };

  const remove = (id: string) => {
    setOps((o) => o.filter((x) => x.id !== id));
    setError(null);
  };

  const clear = () => {
    setOps([]);
    setResults(null);
    setShots(null);
    setIdealProbs(null);
    setError(null);
  };

  const reset = () => {
    setResults(null);
    setShots(null);
    setIdealProbs(null);
    setError(null);
  };

  const run = () => {
    try {
      setRunning(true);
      setError(null);
      setTimeout(() => {
        const res = runCircuit(ops, qubits);
        setResults(res);
        // Ideal distribution = state after all non-measurement gates.
        // For circuits without measurement this equals the final state;
        // with terminal measurement it's the distribution the shots sample.
        const noMeasure = ops.filter((o) => o.gate !== "M");
        setIdealProbs(noMeasure.length ? runCircuit(noMeasure, qubits).probabilities : probabilities(res.state));
        const counts = new Array(2 ** qubits).fill(0);
        for (let i = 0; i < 1000; i++) {
          const m = runCircuit(ops, qubits).measuredBits;
          if (m) {
            let v = 0;
            m.forEach((b, qi) => (v += b * 2 ** qi));
            counts[v]++;
          }
        }
        setShots(counts);
        recordActivity();
        setRunning(false);
        onRun?.(ops, qubits);
      }, 350);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to run circuit. Please check your circuit.");
      setRunning(false);
    }
  };

  const save = () => {
    if (!currentUser) return;
    if (ops.length === 0) {
      setError("Nothing to save — build a circuit first.");
      return;
    }
    const summary = idealProbs ? idealProbs.map((p, i) => `${ket(i, qubits)} ${(p * 100).toFixed(0)}%`).join(" · ") : "";
    addExperiment(expName || "Custom circuit", ops, qubits, summary);
    onSave?.(ops, qubits, summary);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const evalResult = evaluator ? evaluator(ops, qubits) : null;

  const cellFor = (qubit: number, col: number) => {
    const cellOps = ops.filter((o) => o.qubits[0] === qubit && o.col === col && o.gate !== "CNOT" && o.gate !== "SWAP");
    const cnot = ops.find((o) => o.gate === "CNOT" && o.qubits[0] === qubit && o.col === col);
    const cnotTarget = ops.find((o) => o.gate === "CNOT" && o.qubits[1] === qubit && o.col === col);
    const swap = ops.find((o) => o.gate === "SWAP" && o.qubits.includes(qubit) && o.col === col);
    const m = cellOps.find((o) => o.gate === "M");
    const single = cellOps.find((o) => o.gate !== "M");

    const rm = (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      remove(id);
    };

    if (cnot) {
      return (
        <g onClick={rm(cnot.id)} className="cursor-pointer" role="button" aria-label="Remove CNOT">
          <circle cx={0} cy={0} r={4.5} fill="var(--viz-dot)" />
          <line x1={0} y1={0} x2={0} y2={(cnot.qubits[1] - cnot.qubits[0]) * ROW_H} stroke="var(--viz-wire-strong)" strokeWidth="1.5" />
        </g>
      );
    }
    if (cnotTarget) {
      const c = ops.find((o) => o.gate === "CNOT" && o.qubits[1] === qubit && o.col === col)!;
      return (
        <circle cx={0} cy={0} r={10} fill="var(--viz-measure-bg)" stroke="var(--viz-measure-ring)" strokeWidth="1.5" className="cursor-pointer" onClick={rm(c.id)} role="button" aria-label="Remove CNOT" />
      );
    }
    if (swap) {
      const isFirst = swap.qubits[0] === qubit;
      const other = swap.qubits[isFirst ? 1 : 0];
      return (
        <g onClick={rm(swap.id)} className="cursor-pointer" role="button" aria-label="Remove SWAP">
          {isFirst && <line x1={0} y1={0} x2={0} y2={(other - qubit) * ROW_H} stroke="var(--viz-wire-strong)" strokeWidth="1.5" />}
          <circle cx={0} cy={0} r={9} fill="var(--viz-measure-bg)" stroke="var(--viz-measure-ring)" strokeWidth="1.5" />
          <text x={0} y={4} textAnchor="middle" fill="var(--viz-measure-text)" fontSize="11" fontFamily="monospace" fontWeight="700">×</text>
        </g>
      );
    }
    if (m) {
      return (
        <g onClick={rm(m.id)} className="cursor-pointer" role="button" aria-label="Remove measurement">
          <rect x={-13} y={-12} width={26} height={24} rx={4} fill="var(--viz-chip-bg)" stroke="var(--viz-wire-strong)" />
          <text x={0} y={5} textAnchor="middle" fill="var(--viz-chip-text)" fontSize="12" fontFamily="monospace" fontWeight="700">M</text>
        </g>
      );
    }
    if (single) {
      return (
        <g onClick={rm(single.id)} className="cursor-pointer" role="button" aria-label={`Remove ${single.gate} gate`}>
          <rect x={-13} y={-12} width={26} height={24} rx={4} fill="var(--viz-gate-bg)" stroke="var(--viz-gate-ring, #8b5cf6)" />
          <text x={0} y={5} textAnchor="middle" fill="var(--viz-gate-text)" fontSize="13" fontFamily="monospace" fontWeight="700">{single.gate}</text>
        </g>
      );
    }
    return null;
  };

  const selectedProbs = idealProbs;

  return (
    <div className={`grid gap-5 ${embedded ? "" : "xl:grid-cols-[1fr_340px]"}`}>
      {/* palette */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card p-3">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-ink-3">Gates</span>
          {PALETTE.map((g) => (
            <button
              key={g.gate}
              onClick={() => selectGate(g.gate)}
              title={g.hint}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border font-mono text-base font-bold transition ${
                armed === g.gate
                  ? "border-qx-cyan bg-qx-cyan/20 text-qx-cyan"
                  : "border-qx-violet/40 bg-qx-violet/10 text-qx-violet hover:bg-qx-violet/25"
              }`}
            >
              {g.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setQubits((q) => Math.max(1, q - 1))}
              disabled={qubits <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card2 text-ink-2 hover:bg-card2 disabled:opacity-30"
              aria-label="Fewer qubits"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-sm text-ink-2">{qubits} qubit{qubits > 1 ? "s" : ""}</span>
            <button
              onClick={() => setQubits((q) => Math.min(maxQubits, q + 1))}
              disabled={qubits >= maxQubits}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card2 text-ink-2 hover:bg-card2 disabled:opacity-30"
              aria-label="More qubits"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Load</span>
          <select
            className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-ink-2 focus:outline-none focus:border-qx-violet/60"
            onChange={(e) => {
              const p = PRESETS.find((x) => x.name === e.target.value);
              if (p) {
                setOps(p.ops.map((o) => ({ ...o, id: crypto.randomUUID() })));
                setQubits(p.qubits);
                setResults(null);
                setShots(null);
                setIdealProbs(null);
                setError(null);
              }
            }}
            defaultValue="— Presets —"
          >
            {PRESETS.map((p) => <option key={p.name}>{p.name}</option>)}
          </select>
          <span className="text-xs text-ink-3">· click a gate, then click a wire cell to place · click a placed gate to remove</span>
        </div>

        {/* canvas */}
        <Card className="overflow-x-auto p-4">
          <svg
            width={Math.max((MAX_COLS + 1) * COL_W + LABEL_W, qubits * COL_W + 40 + LABEL_W)}
            height={qubits * ROW_H + 10}
            viewBox={`0 0 ${Math.max((MAX_COLS + 1) * COL_W + LABEL_W, qubits * COL_W + 40 + LABEL_W)} ${qubits * ROW_H + 10}`}
            className="block"
            role="img"
            aria-label="Circuit canvas"
          >
            {/* wires */}
            {Array.from({ length: qubits }).map((_, q) => (
              <g key={q}>
                <line x1={44} y1={q * ROW_H + ROW_H / 2} x2={(MAX_COLS + 1) * COL_W + LABEL_W} y2={q * ROW_H + ROW_H / 2} stroke="var(--viz-wire)" strokeWidth="1.5" />
                <text x={34} y={q * ROW_H + ROW_H / 2 + 4} textAnchor="end" fill={q === 0 ? "var(--viz-gate-text)" : "var(--viz-measure-text)"} fontSize="12" fontFamily="monospace">q{q}</text>
              </g>
            ))}
            {/* cells */}
            {Array.from({ length: qubits }).map((_, q) =>
              Array.from({ length: MAX_COLS + 1 }).map((_, c) => (
                <g
                  key={`${q}-${c}`}
                  transform={`translate(${c * COL_W + COL_W / 2 + LABEL_W}, ${q * ROW_H + ROW_H / 2})`}
                >
                  <rect
                    x={-20}
                    y={-18}
                    width={40}
                    height={36}
                    rx={6}
                    fill={armed ? "var(--viz-measure-bg)" : "transparent"}
                    stroke={armed ? "var(--viz-measure-bg)" : "transparent"}
                    strokeDasharray="3 3"
                    className="cursor-pointer"
                    onClick={() => place(q, c)}
                  />
                  {cellFor(q, c)}
                </g>
              ))
            )}
            {/* column guides */}
            {Array.from({ length: MAX_COLS + 1 }).map((_, c) => (
              <text key={c} x={c * COL_W + COL_W / 2 + LABEL_W} y={qubits * ROW_H + 2} textAnchor="middle" fill="var(--viz-wire)" fontSize="9" fontFamily="monospace">
                {c + 1}
              </text>
            ))}
          </svg>
        </Card>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
            ⚠ {error}
          </div>
        )}

        {evaluator && evalResult && (
          <div className={`rounded-xl border p-4 ${evalResult.pass ? "border-qx-mint/40 bg-qx-mint/10" : "border-rose-500/40 bg-rose-500/10"}`}>
            <p className={`font-semibold ${evalResult.pass ? "text-qx-mint" : "text-rose-300"}`}>
              {evalResult.pass ? "✓ Challenge complete!" : "✗ Not quite yet"}
            </p>
            <p className="mt-1 text-sm text-ink-2">{evalResult.message}</p>
          </div>
        )}

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={run} disabled={running || ops.length === 0} size="lg">
            <Play className="h-4 w-4" /> {running ? "Running…" : "Run Circuit"}
          </Button>
          <Button variant="secondary" onClick={reset} disabled={!results}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="secondary" onClick={clear}>
            <Eraser className="h-4 w-4" /> Clear Circuit
          </Button>
          {currentUser && (
            <>
              <input
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                placeholder="Experiment name"
                className="w-44 rounded-xl border border-line bg-card2 px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-qx-violet/60 focus:outline-none"
              />
              <Button variant={saved ? "success" : "secondary"} onClick={save}>
                {saved ? "Saved ✓" : <><Save className="h-4 w-4" /> Save (+10 XP)</>}
              </Button>
            </>
          )}
          {ops.length > 0 && (
            <button onClick={() => setOps([])} className="ml-auto flex items-center gap-1 text-xs text-ink-3 hover:text-rose-400">
              <Trash2 className="h-3.5 w-3.5" /> remove all
            </button>
          )}
        </div>
      </div>

      {/* results panel */}
      {!embedded && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Circuit info</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-line bg-card2/60 p-3">
                <p className="font-mono text-2xl font-bold text-qx-violet">{qubits}</p>
                <p className="text-xs text-ink-3">qubits</p>
              </div>
              <div className="rounded-xl border border-line bg-card2/60 p-3">
                <p className="font-mono text-2xl font-bold text-qx-cyan">{ops.length}</p>
                <p className="text-xs text-ink-3">gates</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-3">
              {ops.length === 0
                ? "Build a circuit to see its info here."
                : `Column depth: ${maxCol + 1}. ${ops.filter((o) => o.gate === "M").length} measurement${ops.filter((o) => o.gate === "M").length === 1 ? "" : "s"}.`}
            </p>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Results</h3>
              {results && <SimulatedBadge />}
            </div>
            {!results ? (
              <p className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-ink-3">
                Run the circuit to see the probability distribution.
              </p>
            ) : (
              <div className="space-y-2.5">
                {selectedProbs!.map((p, i) => {
                  if (p < 0.0005) return null;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-16 shrink-0 text-right font-mono text-sm text-ink-2">{ket(i, qubits)}</span>
                      <div className="h-6 flex-1 overflow-hidden rounded-md bg-card2">
                        <div className="h-full rounded-md bg-accent/80 transition-all duration-500" style={{ width: `${p * 100}%` }} />
                      </div>
                      <span className="w-24 shrink-0 font-mono text-sm">
                        {shots && shots[i] > 0 && <span className="mr-1 text-ink-3">{shots[i]}</span>}
                        <span className="text-ink">{(p * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                  );
                })}
                {results.measuredBits && (
                  <div className="mt-3 rounded-lg border border-qx-cyan/25 bg-qx-cyan/10 px-3 py-2 font-mono text-sm text-qx-cyan">
                    Last run measured: {results.measuredBits.map((b, qi) => `q${qi}=${b}`).join(", ")}
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 font-semibold text-ink">What happened?</h3>
            <p className="text-sm leading-relaxed text-ink-2">
              {results ? explainCircuit(ops, qubits) : "Run the circuit and we'll explain each step in plain language."}
            </p>
          </Card>
        </div>
      )}

      {showAiTools && (
        <div className={embedded ? "" : "xl:col-span-2"}>
          <CircuitAiPanel ops={ops} qubits={qubits} topicId={aiTopicId} spec={aiSpec} />
        </div>
      )}
    </div>
  );
}