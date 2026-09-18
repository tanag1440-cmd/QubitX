import React, { useMemo, useState } from "react";
import { Ket } from "../quantum/display";
import { Button, Card } from "../ui";
import { StateViz } from "./StateViz";

/**
 * Lesson 3 demo: drag a slider to set the |0⟩/|1⟩ mix, watch probabilities
 * update in real time, then Measure the qubit and see a sampled outcome.
 */
export function SuperpositionViz() {
  const [p0, setP0] = useState(70);
  const [measured, setMeasured] = useState<0 | 1 | null>(null);
  const [collapsed, setCollapsed] = useState<0 | 1 | null>(null);
  const [history, setHistory] = useState<(0 | 1)[]>([]);

  const alpha = useMemo(() => ({ re: Math.sqrt(p0 / 100), im: 0 }), [p0]);
  const beta = useMemo(() => ({ re: Math.sqrt((100 - p0) / 100), im: 0 }), [p0]);

  const measure = () => {
    const r = Math.random() * 100;
    const outcome: 0 | 1 = r < p0 ? 0 : 1;
    setMeasured(outcome);
    setCollapsed(outcome);
    setHistory((h) => [outcome, ...h].slice(0, 24));
  };

  const reset = () => {
    setMeasured(null);
    setCollapsed(null);
    setHistory([]);
  };

  const zeros = history.filter((h) => h === 0).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-ink">Adjust the qubit</h4>
          <span className="font-mono text-sm text-qx-cyan">{p0}%</span>
        </div>

        <div className="mt-6 flex justify-center">
          <StateViz alpha={alpha} beta={beta} collapsedTo={collapsed} />
        </div>

        <div className="mt-6">
          <div className="mb-1 flex justify-between text-xs font-medium text-ink-2">
            <span className="text-qx-violet">More |0⟩</span>
            <span className="text-qx-cyan">More |1⟩</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={p0}
            disabled={measured !== null}
            onChange={(e) => setP0(Number(e.target.value))}
            className="w-full accent-violet-500"
            aria-label="Probability of measuring |0⟩"
          />
          <p className="mt-2 text-center text-xs text-ink-3">
            <Ket value={0} /> probability: <span className="font-mono text-qx-violet">{p0}%</span> &nbsp;·&nbsp;{" "}
            <Ket value={1} /> probability: <span className="font-mono text-qx-cyan">{100 - p0}%</span>
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={measure} disabled={measured !== null} className="flex-1">
            Measure Qubit
          </Button>
          <Button variant="secondary" onClick={reset} className="flex-1">
            Reset
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          While the slider is free, the qubit is genuinely in a blend of both states — not secretly one of them.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-ink">Measurement results</h4>

        {measured === null ? (
          <p className="mt-4 text-sm text-ink-2">
            Press <span className="font-semibold text-ink">Measure Qubit</span> to sample from the distribution.
            Each run is random, but the pattern follows the slider.
          </p>
        ) : (
          <div className="mt-4 rounded-xl border border-qx-mint/30 bg-qx-mint/10 p-4">
            <p className="text-sm text-ink-2">This run measured:</p>
            <p className="mt-1 font-mono text-4xl font-bold text-qx-mint">
              <Ket value={measured} />
            </p>
            <p className="mt-2 text-sm text-ink-2">
              The superposition collapsed. Measure again and it stays{" "}
              <span className="font-mono text-qx-mint"><Ket value={measured} /></span> — 100% of the time.
            </p>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Run history</p>
            <p className="text-xs text-ink-3">{zeros} × |0⟩ · {history.length - zeros} × |1⟩</p>
          </div>
          {history.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line py-6 text-center text-xs text-ink-3">
              No measurements yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`flex h-7 w-9 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    h === 0 ? "bg-qx-violet/20 text-qx-violet" : "bg-qx-cyan/20 text-qx-cyan"
                  }`}
                >
                  {h}
                </span>
              ))}
            </div>
          )}
          {history.length > 3 && (
            <p className="mt-3 text-xs text-ink-3">
              The mix of chips tracks the slider: more |0⟩ → more violet chips.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}