import React, { useState } from "react";
import { Ket } from "../quantum/display";
import { Button, Card } from "../ui";
import { StateViz } from "./StateViz";

/** Lesson 4 demo: measuring collapses superposition, and re-measuring is deterministic. */
export function MeasurementViz() {
  const [phase, setPhase] = useState<"ready" | "collapsing" | "collapsed">("ready");
  const [outcome, setOutcome] = useState<0 | 1 | null>(null);
  const [repeats, setRepeats] = useState<(0 | 1)[]>([]);

  const measure = () => {
    setPhase("collapsing");
    const result: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
    setTimeout(() => {
      setOutcome(result);
      setPhase("collapsed");
      setRepeats((r) => [result, ...r].slice(0, 6));
    }, 650);
  };

  const reset = () => {
    setPhase("ready");
    setOutcome(null);
    setRepeats([]);
  };

  const alpha = { re: 1 / Math.sqrt(2), im: 0 };
  const beta = { re: 1 / Math.sqrt(2), im: 0 };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="flex flex-col items-center p-6">
        <h4 className="self-start font-semibold text-white">A qubit in 50/50 superposition</h4>
        <div className="my-4 flex justify-center">
          <StateViz
            alpha={phase === "ready" ? alpha : outcome === 0 ? { re: 1, im: 0 } : { re: 0, im: 0 }}
            beta={phase === "ready" ? beta : outcome === 1 ? { re: 1, im: 0 } : { re: 0, im: 0 }}
            collapsedTo={phase === "collapsed" ? outcome : null}
          />
        </div>
        <p className="text-center text-sm text-slate-400">
          {phase === "ready" && "50% |0⟩ · 50% |1⟩ — genuinely both at once."}
          {phase === "collapsing" && "Collapsing… the blend is being replaced by one definite answer."}
          {phase === "collapsed" && outcome !== null && (
            <>Measured <span className="font-mono font-bold text-qx-mint"><Ket value={outcome} /></span>.
              The superposition is gone.</>
          )}
        </p>
        <div className="mt-5 flex gap-3">
          <Button onClick={measure} disabled={phase === "collapsing"} className="flex-1">Measure</Button>
          <Button variant="secondary" onClick={reset} className="flex-1">Reset</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-white">Measuring again: same answer, every time</h4>
        <p className="mt-2 text-sm text-slate-400">
          After collapse the qubit sits in the measured state. Hit <span className="font-semibold text-white">Measure</span> a
          few times — the outcome locks in and never flips.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {repeats.map((r, i) => (
            <span key={i} className={`flex h-9 w-12 items-center justify-center rounded-lg font-mono font-bold ${r === 0 ? "bg-qx-violet/20 text-qx-violet" : "bg-qx-cyan/20 text-qx-cyan"}`}>
              <Ket value={r} />
            </span>
          ))}
          {repeats.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-xs text-slate-500">
              Results appear here after the first measurement.
            </p>
          )}
        </div>
        {repeats.length >= 2 && (
          <p className="mt-3 text-xs text-qx-mint">
            ✓ All {repeats.length} runs agree — measurement destroyed the superposition, not the value.
          </p>
        )}
        <div className="mt-6 rounded-xl border border-white/10 bg-ink-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Why this matters</p>
          <p className="mt-2 text-sm text-slate-400">
            Quantum algorithms must therefore engineer the probabilities <em>before</em> the final measurement —
            once you look, you can't change what you see.
          </p>
        </div>
      </Card>
    </div>
  );
}