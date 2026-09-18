import React, { useState } from "react";
import { applyOp, describeStateWithPct, probabilities } from "../../lib/simulator";
import type { CircuitOp, GateType } from "../../types";
import { Ket } from "../quantum/display";
import { Button, Card } from "../ui";
import { StateViz } from "./StateViz";

const GATE_INFO: Record<GateType, string> = {
  H: "Hadamard: creates an equal superposition of |0⟩ and |1⟩.",
  X: "X (NOT): flips |0⟩ ↔ |1⟩.",
  Y: "Y: rotates the qubit around the Y axis (flip + phase).",
  Z: "Z: flips the sign of |1⟩ (a phase flip, probabilities unchanged).",
  S: "S: rotates the phase of |1⟩ by 90°.",
  T: "T: rotates the phase of |1⟩ by 45°.",
  CNOT: "CNOT needs two qubits — not available here.",
  SWAP: "SWAP needs two qubits — not available here.",
  M: "Measurement is a special operation.",
};

/** Lesson 5 demo: apply real gates to a single qubit, watch probabilities & state. */
export function GatePlayground() {
  const [ops, setOps] = useState<CircuitOp[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const state = ops.reduce(
    (s, op) => applyOp(s, op),
    [{ re: 1, im: 0 }, { re: 0, im: 0 }]
  );
  const probs = probabilities(state);
  const [alpha, beta] = state;

  const apply = (gate: GateType) => {
    const op: CircuitOp = { id: crypto.randomUUID(), gate, qubits: [0], col: ops.length };
    setOps((o) => [...o, op]);
    setHistory((h) => [GATE_INFO[gate], ...h].slice(0, 4));
  };

  const reset = () => {
    setOps([]);
    setHistory([]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h4 className="font-semibold text-ink">Apply gates to |0⟩</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["H", "X", "Y", "Z", "S", "T"] as GateType[]).map((g) => (
            <button
              key={g}
              onClick={() => apply(g)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-qx-violet/40 bg-qx-violet/10 font-mono text-lg font-bold text-qx-violet transition hover:bg-qx-violet/25 "
              aria-label={`Apply ${g} gate`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={reset}
            className="ml-auto rounded-xl border border-line bg-card2 px-4 text-sm text-ink-2 hover:bg-card2"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <StateViz alpha={alpha} beta={beta} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-5 font-mono text-sm">
          <span className="text-ink-2"><Ket value={0} /> <span className="text-qx-violet">{Math.round(probs[0] * 100)}%</span></span>
          <span className="text-ink-2"><Ket value={1} /> <span className="text-qx-cyan">{Math.round(probs[1] * 100)}%</span></span>
        </div>
        <p className="mt-2 text-center text-xs text-ink-3">
          Gate sequence: <span className="font-mono text-ink-2">{ops.map((o) => o.gate).join(" → ") || "—"}</span>
        </p>
        <p className="mt-2 text-center font-mono text-xs text-qx-cyan">
          {describeStateWithPct(state, 1)}
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-ink">What each gate just did</h4>
        {history.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-line py-8 text-center text-sm text-ink-3">
            Click a gate to see its effect on the qubit.
          </p>
        ) : (
          <ul className="mt-2 space-y-2.5">
            {history.map((h, i) => (
              <li key={i} className="rounded-xl border border-line bg-card2/60 p-3 text-sm text-ink-2">
                {h}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 rounded-xl border border-line bg-card2/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Try this</p>
          <p className="mt-2 text-sm text-ink-2">
            Apply <span className="font-mono text-qx-cyan">H</span> twice. The state returns to |0⟩ — H is its own
            inverse. Then try <span className="font-mono text-qx-cyan">H</span> + <span className="font-mono text-qx-cyan">X</span>:
            an X on a superposition still flips it perfectly.
          </p>
        </div>
      </Card>
    </div>
  );
}