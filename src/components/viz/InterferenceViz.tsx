import React, { useState } from "react";
import { Ket } from "../quantum/display";
import { Button, Card } from "../ui";

type Input = "plus" | "minus";

const S = 1 / Math.sqrt(2);

/**
 * Lesson 8 demo: interference via H·H. Shows the amplitude arithmetic:
 * H(|0⟩+|1⟩)/√2 → |0⟩ (the |1⟩ paths cancel), H(|0⟩−|1⟩)/√2 → |1⟩
 * (the |0⟩ paths cancel). The minus sign — phase — decides which answer survives.
 */
export function InterferenceViz() {
  const [input, setInput] = useState<Input>("plus");

  const a0 = S;
  const a1 = input === "plus" ? S : -S;

  // Second H: new|0⟩ = (a0 + a1)/√2 ; new|1⟩ = (a0 − a1)/√2
  const out0 = (a0 + a1) / Math.sqrt(2);
  const out1 = (a0 - a1) / Math.sqrt(2);

  const rows = [
    {
      label: `Path to ${"|0⟩"}`,
      formula: `(a0 + a1)/√2`,
      terms: [a0, a1],
      result: out0,
      outcome: 0,
    },
    {
      label: `Path to ${"|1⟩"}`,
      formula: `(a0 − a1)/√2`,
      terms: [a0, -a1],
      result: out1,
      outcome: 1,
    },
  ];

  const surviving = Math.abs(out0) > Math.abs(out1) ? 0 : 1;
  const maxTerm = Math.max(Math.abs(a0), Math.abs(a1));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">After the first H, apply H again</p>
            <p className="mt-1 text-sm text-slate-400">
              Each final state is reached by <em>two</em> paths. When the paths have opposite signs they cancel —
              that's destructive interference. When they share a sign they reinforce — constructive.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={input === "plus" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setInput("plus")}
            >
              Input (|0⟩+|1⟩)/√2
            </Button>
            <Button
              variant={input === "minus" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setInput("minus")}
            >
              Input (|0⟩−|1⟩)/√2
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className={`rounded-xl border p-4 ${Math.abs(r.result) > 0.01 ? "border-qx-mint/40 bg-qx-mint/5" : "border-rose-500/40 bg-rose-500/5"}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {r.label} <span className="ml-1 font-mono normal-case">{r.formula}</span>
              </p>
              <div className="mt-3 space-y-1.5">
                {r.terms.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`h-4 w-full max-w-[160px] rounded ${t >= 0 ? "bg-qx-cyan/70" : "bg-rose-500/70"}`}
                      style={{ width: `${(Math.abs(t) / maxTerm) * 100}%`, maxWidth: 160 }} />
                    <span className="font-mono text-xs text-slate-400">{t >= 0 ? "+" : ""}{t.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                <span className="text-xs text-slate-500">=</span>
                <span className={`font-mono text-lg font-bold ${Math.abs(r.result) > 0.01 ? "text-qx-mint" : "text-rose-400"}`}>
                  {Math.abs(r.result).toFixed(2)}
                </span>
                <span className={`font-mono text-sm font-bold ${Math.abs(r.result) > 0.01 ? "text-qx-mint" : "text-rose-400"}`}>
                  <Ket value={r.outcome} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-qx-cyan/30 bg-qx-cyan/10 p-4">
          <p className="text-sm text-slate-200">
            {surviving === 0 ? (
              <>The <Ket value={1} /> paths cancelled → measuring gives <span className="font-mono font-bold text-qx-mint">|0⟩</span> with 100% probability.</>
            ) : (
              <>The <Ket value={0} /> paths cancelled → measuring gives <span className="font-mono font-bold text-qx-mint">|1⟩</span> with 100% probability.</>
            )}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            The only difference between the two inputs is a minus sign — the <em>phase</em>. Quantum algorithms set
            up phases so that wrong answers cancel and the answer you want survives measurement.
          </p>
        </div>
      </Card>
    </div>
  );
}