import React, { useState } from "react";
import { Ket } from "../quantum/display";
import { Card } from "../ui";
import { StateViz } from "./StateViz";

const STATES = [
  { id: "zero", label: "Definitely |0⟩", alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 }, note: "The qubit is exactly |0⟩. Measure it: always 0." },
  { id: "mix", label: "Superposition", alpha: { re: 1 / Math.sqrt(2), im: 0 }, beta: { re: 1 / Math.sqrt(2), im: 0 }, note: "A blend of both. Measure it: 50/50 chance." },
  { id: "one", label: "Definitely |1⟩", alpha: { re: 0, im: 0 }, beta: { re: 1, im: 0 }, note: "The qubit is exactly |1⟩. Measure it: always 1." },
] as const;

/** Lesson 2 demo: three states of a qubit. */
export function QubitVisual() {
  const [idx, setIdx] = useState(1);
  const s = STATES[idx];

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
        <div className="flex justify-center">
          <StateViz alpha={s.alpha} beta={s.beta} />
        </div>
        <div className="w-full max-w-sm space-y-2">
          {STATES.map((st, i) => (
            <button
              key={st.id}
              onClick={() => setIdx(i)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                i === idx ? "border-qx-violet/60 bg-qx-violet/10" : "border-line bg-card2/50 hover:bg-card2/60"
              }`}
            >
              <p className={`text-sm font-semibold ${i === idx ? "text-qx-violet" : "text-ink-2"}`}>{st.label}</p>
              <p className="mt-1 text-xs text-ink-3">{st.note}</p>
            </button>
          ))}
          <div className="rounded-xl border border-line bg-card2/60 p-3 text-xs text-ink-2">
            The dial above is a simplified picture. A real qubit also carries a <em>phase</em> — the relative
            timing of its waves — which the Bloch sphere visualizer shows in 3D.
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-ink-3">
        Tip: superposition isn't "we don't know which" — it's a real combination, exactly like a spinning coin isn't
        secretly heads.
      </p>
    </Card>
  );
}
