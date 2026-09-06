import React, { useMemo, useState } from "react";
import { runCircuit } from "../../lib/simulator";
import type { CircuitOp } from "../../types";
import { Ket, SimulatedBadge } from "../quantum/display";
import { Button, Card } from "../ui";

const BELL_OPS: CircuitOp[] = [
  { id: "h0", gate: "H", qubits: [0], col: 0 },
  { id: "cnot", gate: "CNOT", qubits: [0, 1], col: 1 },
];

const SHOTS = 1000;

/** Lesson 6 demo: Bell-state circuit with a shot histogram (honest sampling). */
export function CircuitMini() {
  const [shots, setShots] = useState<number[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setShots(null);
    setTimeout(() => {
      const counts = [0, 0, 0, 0];
      for (let i = 0; i < SHOTS; i++) {
        const { measuredBits } = runCircuit(BELL_OPS, 2);
        if (measuredBits) counts[measuredBits[0] + measuredBits[1] * 2]++;
      }
      setShots(counts);
      setRunning(false);
    }, 400);
  };

  const probs = useMemo(() => runCircuit(BELL_OPS, 2).probabilities, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h4 className="mb-4 font-semibold text-white">The Bell-state circuit</h4>
        {/* circuit diagram */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-900/70 p-4">
          <svg viewBox="0 0 260 90" className="w-full min-w-[240px]">
            {/* wires */}
            <line x1="10" y1="25" x2="250" y2="25" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="10" y1="65" x2="250" y2="65" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            {/* labels */}
            <text x="6" y="29" fill="#a78bfa" fontSize="11" fontFamily="monospace" textAnchor="end">q0</text>
            <text x="6" y="69" fill="#67e8f9" fontSize="11" fontFamily="monospace" textAnchor="end">q1</text>
            {/* H gate on q0 */}
            <rect x="45" y="13" width="26" height="24" rx="4" fill="rgba(139,92,246,0.25)" stroke="#8b5cf6" />
            <text x="58" y="29" fill="#c4b5fd" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="700">H</text>
            {/* CNOT: control on q0, target on q1 */}
            <circle cx="110" cy="25" r="4" fill="#e2e8f0" />
            <line x1="110" y1="25" x2="110" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="110" cy="65" r="8" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="1.5" />
            <circle cx="110" cy="65" r="2.5" fill="#67e8f9" />
            {/* measurements */}
            <rect x="170" y="13" width="26" height="24" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
            <text x="183" y="29" fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">M</text>
            <rect x="170" y="53" width="26" height="24" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
            <text x="183" y="69" fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">M</text>
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">H on q0, then CNOT q0 → q1.</p>
          <Button onClick={run} disabled={running} size="sm">
            {running ? "Running…" : shots ? "Run again" : "Run circuit"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Each run samples {SHOTS.toLocaleString()} measurements from the true quantum distribution — no faked numbers.
        </p>
      </Card>

      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-white">Results</h4>
          <SimulatedBadge />
        </div>

        {shots === null ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
            {running ? "Simulating 1000 shots…" : "Run the circuit to see the histogram."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => {
              const pct = (shots[i] / SHOTS) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 text-right font-mono text-sm text-slate-300"><Ket value={i} n={2} /></div>
                  <div className="h-7 flex-1 overflow-hidden rounded-md bg-white/5">
                    <div
                      className={`h-full rounded-md ${i === 0 || i === 3 ? "bg-gradient-to-r from-qx-violet/70 to-qx-indigo/70" : "bg-rose-500/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-24 font-mono text-sm text-white">{shots[i]} <span className="text-slate-500">({pct.toFixed(0)}%)</span></div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What happened?</p>
          <p className="mt-2 text-sm text-slate-400">
            H put q0 in superposition; CNOT flipped q1 only in the |1⟩ branch. Result: the entangled Bell state —
            50% <span className="font-mono"><Ket value={0} n={2} /></span>, 50% <span className="font-mono"><Ket value={3} n={2} /></span>,
            and the two qubits always agree when measured.
          </p>
        </div>
      </Card>
    </div>
  );
}