import React, { useState } from "react";
import { Ket } from "../quantum/display";
import { Button, Card } from "../ui";

/** Lesson 7 demo: Bell pair — measuring one qubit decides the other, always equal. */
export function EntanglementViz() {
  const [runs, setRuns] = useState<{ a: 0 | 1; b: 0 | 1 }[]>([]);
  const [justMeasured, setJustMeasured] = useState<{ a: 0 | 1; b: 0 | 1 } | null>(null);

  const run = () => {
    const a: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
    const b: 0 | 1 = a; // Bell state: outcomes always equal
    setJustMeasured({ a, b });
    setRuns((r) => [{ a, b }, ...r].slice(0, 12));
  };

  const reset = () => {
    setRuns([]);
    setJustMeasured(null);
  };

  const equal = runs.filter((r) => r.a === r.b).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold text-ink">The entangled pair</h4>
          <span className="font-mono text-sm text-ink-2">(|00⟩ + |11⟩)/√2</span>
        </div>

        {/* the two qubit cards */}
        <div className="flex items-center justify-center gap-4">
          <QubitCard label="Qubit 0 · Alice" value={justMeasured?.a ?? null} color="violet" />
          <svg width="48" height="24" viewBox="0 0 48 24" className="text-ink-3">
            <path d="M2 12 H46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <QubitCard label="Qubit 1 · Bob" value={justMeasured?.b ?? null} color="cyan" />
        </div>

        <p className="mt-4 text-center text-sm text-ink-2">
          {justMeasured === null
            ? "Neither qubit has a value yet. Measure the pair — they decide together, and always agree."
            : <>Measured: <span className="font-mono text-qx-violet"><Ket value={justMeasured.a} /></span> and{" "}
              <span className="font-mono text-qx-cyan"><Ket value={justMeasured.b} /></span> — perfectly correlated.</>}
        </p>

        <div className="mt-5 flex gap-3">
          <Button onClick={run} className="flex-1">Measure the pair</Button>
          <Button variant="secondary" onClick={reset} className="flex-1">Reset</Button>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          "Spooky action at a distance": in a real experiment these qubits can be kilometres apart and still agree.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-ink">Statistics over runs</h4>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[["00", "violet"], ["01", "rose"], ["10", "rose"], ["11", "cyan"]].map(([st, col]) => {
            const [a, b] = st.split("").map(Number);
            const count = runs.filter((r) => r.a === a && r.b === b).length;
            return (
              <div key={st} className="rounded-xl border border-line bg-card2/60 p-3">
                <p className={`font-mono text-lg font-bold ${col === "rose" ? "text-rose-400" : col === "violet" ? "text-qx-violet" : "text-qx-cyan"}`}>
                  <Ket value={Number(st)} n={2} />
                </p>
                <p className="text-xs text-ink-2">{count}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Outcomes {`|01⟩`} and {`|10⟩`} are impossible — the qubits never disagree.
        </p>
        {runs.length >= 3 && (
          <div className="mt-4 rounded-xl border border-qx-mint/30 bg-qx-mint/10 p-4">
            <p className="text-sm text-ink-2">
              {equal}/{runs.length} runs matched. Entanglement guarantees <span className="font-semibold text-qx-mint">100%</span> agreement —
              no classical pair of coins can do this.
            </p>
          </div>
        )}
        {runs.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-line py-6 text-center text-xs text-ink-3">
            Run the experiment to build up statistics.
          </p>
        )}
      </Card>
    </div>
  );
}

function QubitCard({ label, value, color }: { label: string; value: 0 | 1 | null; color: "violet" | "cyan" }) {
  const palettes = {
    violet: { ring: "border-qx-violet/50", chip: "bg-qx-violet/20 text-qx-violet", dot: "bg-qx-violet" },
    cyan: { ring: "border-qx-cyan/50", chip: "bg-qx-cyan/20 text-qx-cyan", dot: "bg-qx-cyan" },
  } as const;
  const p = palettes[color];
  return (
    <div className={`w-32 rounded-2xl border ${value === null ? "border-line" : p.ring} bg-card2/70 p-4 text-center transition-colors`}>
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-card2">
        {value === null ? (
          <span className={`h-3 w-3 rounded-full ${p.dot} animate-pulse-soft`} />
        ) : (
          <span className={`rounded-lg px-2 py-1 font-mono text-xl font-bold ${p.chip}`}><Ket value={value} /></span>
        )}
      </div>
      <p className="text-xs text-ink-2">{label}</p>
    </div>
  );
}