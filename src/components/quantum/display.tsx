import React from "react";
import { describeState } from "../../lib/simulator";
import type { CircuitOp, Complex } from "../../types";
import { Badge } from "../ui";

// ── Ket text: |0⟩, |10⟩ with proper bra-ket styling ─────────────────────────

export function Ket({ value, n, className = "" }: { value: number; n?: number; className?: string }) {
  const digits = n !== undefined ? value.toString(2).padStart(n, "0") : value.toString();
  return (
    <span className={`font-mono whitespace-nowrap ${className}`}>
      |{digits}⟩
    </span>
  );
}

// ── Single amplitude with ket, e.g. "0.707 |0⟩" ─────────────────────────────

export function AmplitudeRow({ amp, value, n }: { amp: Complex; value: number; n: number }) {
  const mag = Math.hypot(amp.re, amp.im);
  if (mag < 1e-6) return null;
  const re = Math.abs(amp.re) < 5e-7 ? 0 : amp.re;
  const im = Math.abs(amp.im) < 5e-7 ? 0 : amp.im;
  let label = "";
  if (Math.abs(Math.abs(re) - 1 / Math.sqrt(2)) < 1e-9) label = (re < 0 ? "-" : "") + "1/√2";
  else if (Math.abs(Math.abs(im) - 1 / Math.sqrt(2)) < 1e-9) label = (im < 0 ? "-" : "") + "i/√2";
  else if (Math.abs(re) === 1) label = re < 0 ? "-1" : "1";
  else if (Math.abs(im) === 1) label = (im < 0 ? "-" : "") + "i";
  else label = `${re.toFixed(3)}${im !== 0 ? (im > 0 ? "+" : "") + im.toFixed(3) + "i" : ""}`;
  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="text-slate-400">{label}</span>
      <Ket value={value} n={n} className="text-white" />
    </div>
  );
}

// ── Probability bar list ─────────────────────────────────────────────────────

export function ProbabilityBars({ probabilities, numQubits, measuredBits, highlight }: {
  probabilities: number[]; numQubits: number; measuredBits?: (0 | 1)[] | null; highlight?: number | null;
}) {
  const shown = probabilities.map((p, i) => ({ i, p })).filter((x) => x.p > 0.0005);
  if (shown.length === 0) {
    return <p className="text-sm text-slate-500">No measurable states.</p>;
  }
  return (
    <div className="space-y-2">
      {shown.map(({ i, p }) => {
        const pct = Math.round(p * 1000) / 10;
        const isHighlighted = highlight === i;
        const matched = measuredBits !== null && measuredBits !== undefined && i === bitsToValue(measuredBits);
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-right font-mono text-sm text-slate-300">
              <Ket value={i} n={numQubits} />
            </div>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-white/5">
              <div
                className={`h-full rounded-md transition-all duration-500 ${isHighlighted ? "bg-gradient-to-r from-qx-cyan to-qx-mint" : "bg-gradient-to-r from-qx-violet/70 to-qx-indigo/70"}`}
                style={{ width: `${Math.max(p * 100, p > 0 ? 3 : 0)}%` }}
              />
            </div>
            <div className="w-24 shrink-0 font-mono text-sm">
              {matched && <span className="mr-1 text-qx-mint">✓</span>}
              <span className="text-white">{pct.toFixed(pct % 1 === 0 ? 0 : 1)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function bitsToValue(bits: (0 | 1)[]): number {
  let v = 0;
  bits.forEach((b, i) => (v += b * 2 ** i));
  return v;
}

// ── State vector panel (ket math) ────────────────────────────────────────────

export function StateVectorPanel({ state, numQubits, title = "State vector" }: {
  state: Complex[]; numQubits: number; title?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <div className="space-y-1">
        {state.map((amp, i) => (
          <AmplitudeRow key={i} amp={amp} value={i} n={numQubits} />
        ))}
      </div>
    </div>
  );
}

// ── "Simulated result" label (never pretend it's real hardware) ──────────────

export function SimulatedBadge() {
  return (
    <Badge color="cyan">
      <span className="h-1.5 w-1.5 rounded-full bg-qx-cyan animate-pulse-soft" />
      Simulated result
    </Badge>
  );
}

// ── Circuit summary (compact, text form) ─────────────────────────────────────

export function circuitAsText(ops: CircuitOp[]): string {
  if (ops.length === 0) return "—";
  return ops.map((o) => (o.gate === "CNOT" ? `CNOT(${o.qubits[0]}→${o.qubits[1]})` : `${o.gate}(${o.qubits[0]})`)).join(" · ");
}

export function stateDescription(state: Complex[], n: number): string {
  return describeState(state, n);
}