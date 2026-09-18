import React from "react";
import { Ket } from "../quantum/display";

/**
 * A 2D dial visualization of a single qubit state (alpha, beta).
 * Top half = |0⟩, bottom half = |1⟩. Fill intensity = probability.
 * A needle points toward the state.
 */
export function StateViz({ alpha, beta, size = 180, collapsedTo }: {
  alpha: { re: number; im: number };
  beta: { re: number; im: number };
  size?: number;
  collapsedTo?: 0 | 1 | null;
}) {
  const p0 = alpha.re * alpha.re + alpha.im * alpha.im;
  const p1 = beta.re * beta.re + beta.im * beta.im;

  // needle angle: -90° (top, |0⟩) .. +90° (bottom, |1⟩), weighted by p1
  const angle = -90 + 180 * p1;
  const rad = (angle * Math.PI) / 180;
  const r = size / 2 - 18;
  const x = size / 2 + r * Math.sin(rad) * 0.35; // compress horizontally for dial feel
  const y = size / 2 + r * Math.cos(rad);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
        {/* dial background */}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="var(--surface-2)" stroke="var(--viz-wire-strong)" strokeWidth="1.5" />
        {/* |0⟩ half */}
        <path
          d={`M ${size / 2} ${size / 2} A ${size / 2 - 4} ${size / 2 - 4} 0 0 1 ${size - 4} ${size / 2} L ${size / 2} ${size / 2} Z`}
          fill="var(--viz-gate-ring, #8b5cf6)"
          opacity={0.12 + p0 * 0.6}
        />
        {/* |1⟩ half */}
        <path
          d={`M ${size / 2} ${size / 2} A ${size / 2 - 4} ${size / 2 - 4} 0 0 1 4 ${size / 2} L ${size / 2} ${size / 2} Z`}
          fill="var(--viz-measure-ring)"
          opacity={0.12 + p1 * 0.6}
        />
        {/* divider */}
        <line x1="4" y1={size / 2} x2={size - 4} y2={size / 2} stroke="var(--viz-wire)" strokeWidth="1" />
        {/* ticks */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--viz-wire)" strokeWidth="1" strokeDasharray="3 5" />
        {/* labels */}
        <text x={size / 2} y={18} textAnchor="middle" fill="var(--viz-gate-text)" fontSize="13" fontWeight="700" fontFamily="monospace">|0⟩</text>
        <text x={size / 2} y={size - 8} textAnchor="middle" fill="var(--viz-measure-text)" fontSize="13" fontWeight="700" fontFamily="monospace">|1⟩</text>
        {/* needle */}
        <g style={{ transition: "all 500ms ease" }}>
          <line
            x1={size / 2} y1={size / 2} x2={x} y2={y}
            stroke={collapsedTo !== null && collapsedTo !== undefined ? (collapsedTo === 0 ? "var(--viz-gate-text)" : "var(--viz-measure-text)") : "var(--viz-dot)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.95"
          />
          <circle cx={size / 2} cy={size / 2} r="4" fill="var(--viz-dot)" />
        </g>
      </svg>
      <div className="mt-1 flex items-center gap-4 font-mono text-xs text-ink-2">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-qx-violet" />
          <Ket value={0} /> {(p0 * 100).toFixed(0)}%
        </span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-qx-cyan" />
          <Ket value={1} /> {(p1 * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}