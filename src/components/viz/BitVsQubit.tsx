import React, { useState } from "react";
import { Ket } from "../quantum/display";
import { Card } from "../ui";

/** Lesson 1 demo: a classical bit only flips 0↔1; a qubit lives on a continuum. */
export function BitVsQubit() {
  const [bit, setBit] = useState<0 | 1>(0);
  const [dial, setDial] = useState(30); // 0..100 mix toward |1⟩

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-ink">Classical bit</h4>
          <span className="font-mono text-xs text-ink-3">1 value at a time</span>
        </div>
        <div className="flex flex-col items-center py-4">
          {/* physical switch */}
          <div
            className="relative h-24 w-16 cursor-pointer rounded-full border border-line-strong bg-card2"
            onClick={() => setBit(bit === 0 ? 1 : 0)}
            role="switch"
            aria-label="Toggle bit"
            aria-checked={bit === 1}
          >
            <div
              className={`absolute left-1/2 h-9 w-9 -translate-x-1/2 rounded-full transition-all duration-200 ${
                bit === 0 ? "top-2 bg-slate-400" : "top-[52px] bg-qx-amber"
              }`}
            />
          </div>
          <p className="mt-4 font-mono text-3xl font-bold text-ink">
            <Ket value={bit} />
          </p>
          <p className="mt-2 text-sm text-ink-2">
            Click the switch — it's strictly 0 or 1, never anything between.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-ink">Qubit</h4>
          <span className="font-mono text-xs text-ink-3">a continuum of states</span>
        </div>
        <div className="flex flex-col items-center py-4">
          <input
            type="range"
            min={0}
            max={100}
            value={dial}
            onChange={(e) => setDial(Number(e.target.value))}
            className="w-40 accent-cyan-400"
            aria-label="Qubit blend"
          />
          <div className="mt-4 flex h-4 w-40 overflow-hidden rounded-full">
            <div className="h-full bg-qx-violet transition-all" style={{ width: `${100 - dial}%` }} />
            <div className="h-full bg-qx-cyan transition-all" style={{ width: `${dial}%` }} />
          </div>
          <p className="mt-4 font-mono text-3xl font-bold text-ink">
            {dial === 0 ? <><Ket value={0} /></> : dial === 100 ? <><Ket value={1} /></> : (
              <span className="text-lg">
                <span className="text-qx-violet">{Math.sqrt((100 - dial) / 100).toFixed(2)} </span>
                <Ket value={0} /> + <span className="text-qx-cyan">{Math.sqrt(dial / 100).toFixed(2)} </span>
                <Ket value={1} />
              </span>
            )}
          </p>
          <p className="mt-2 text-sm text-ink-2">
            Drag the slider — a qubit can live anywhere between |0⟩ and |1⟩.
          </p>
        </div>
      </Card>
    </div>
  );
}