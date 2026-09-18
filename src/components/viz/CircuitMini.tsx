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
        <h4 className="mb-4 font-semibold text-ink">The Bell-state circuit</h4>
        {/* circuit diagram */}
        <div className="overflow-x-auto rounded-xl border border-line bg-card2/70 p-4">
          <svg viewBox="0 0 260 90" className="w-full min-w-[240px]">
            {/* wires */}
            <line x1="10" y1="25" x2="250" y2="25" stroke="var(--viz-wire)" strokeWidth="1.5" />
            <line x1="10" y1="65" x2="250" y2="65" stroke="var(--viz-wire)" strokeWidth="1.5" />
            {/* labels */}
            <text x="6" y="29" fill="var(--viz-gate-text)" fontSize="11" fontFamily="monospace" textAnchor="end">q0</text>
            <text x="6" y="69" fill="var(--viz-measure-text)" fontSize="11" fontFamily="monospace" textAnchor="end">q1</text>
            {/* H gate on q0 */}
            <rect x="45" y="13" width="26" height="24" rx="4" fill="var(--viz-gate-bg)" stroke="var(--viz-gate-ring, #8b5cf6)" />
            <text x="58" y="29" fill="var(--viz-gate-text)" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="700">H</text>
            {/* CNOT: control on q0, target on q1 */}
            <circle cx="110" cy="25" r="4" fill="var(--viz-dot)" />
            <line x1="110" y1="25" x2="110" y2="65" stroke="var(--viz-wire-strong)" strokeWidth="1.5" />
            <circle cx="110" cy="65" r="8" fill="var(--viz-measure-bg)" stroke="var(--viz-measure-ring)" strokeWidth="1.5" />
            <circle cx="110" cy="65" r="2.5" fill="var(--viz-measure-text)" />
            {/* measurements */}
            <rect x="170" y="13" width="26" height="24" rx="4" fill="var(--viz-chip-bg)" stroke="var(--viz-chip-border)" />
            <text x="183" y="29" fill="var(--viz-chip-text)" fontSize="11" fontFamily="monospace" textAnchor="middle">M</text>
            <rect x="170" y="53" width="26" height="24" rx="4" fill="var(--viz-chip-bg)" stroke="var(--viz-chip-border)" />
            <text x="183" y="69" fill="var(--viz-chip-text)" fontSize="11" fontFamily="monospace" textAnchor="middle">M</text>
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-2">H on q0, then CNOT q0 → q1.</p>
          <Button onClick={run} disabled={running} size="sm">
            {running ? "Running…" : shots ? "Run again" : "Run circuit"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Each run samples {SHOTS.toLocaleString()} measurements from the true quantum distribution — no faked numbers.
        </p>
      </Card>

      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-ink">Results</h4>
          <SimulatedBadge />
        </div>

        {shots === null ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-line text-sm text-ink-3">
            {running ? "Simulating 1000 shots…" : "Run the circuit to see the histogram."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => {
              const pct = (shots[i] / SHOTS) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 text-right font-mono text-sm text-ink-2"><Ket value={i} n={2} /></div>
                  <div className="h-7 flex-1 overflow-hidden rounded-md bg-card2">
                    <div
                      className={`h-full rounded-md ${i === 0 || i === 3 ? "bg-accent/80" : "bg-rose-500/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-24 font-mono text-sm text-ink">{shots[i]} <span className="text-ink-3">({pct.toFixed(0)}%)</span></div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-line bg-card2/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">What happened?</p>
          <p className="mt-2 text-sm text-ink-2">
            H put q0 in superposition; CNOT flipped q1 only in the |1⟩ branch. Result: the entangled Bell state —
            50% <span className="font-mono"><Ket value={0} n={2} /></span>, 50% <span className="font-mono"><Ket value={3} n={2} /></span>,
            and the two qubits always agree when measured.
          </p>
        </div>
      </Card>
    </div>
  );
}