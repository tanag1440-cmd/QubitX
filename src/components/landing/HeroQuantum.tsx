import React, { useEffect, useRef, useState } from "react";
import { Ket } from "../quantum/display";
import { runCircuit } from "../../lib/simulator";
import type { CircuitOp } from "../../types";
import { useTheme } from "../../lib/theme";

const HERO_OPS: CircuitOp[] = [
  { id: "h", gate: "H", qubits: [0], col: 0 },
  { id: "cnot", gate: "CNOT", qubits: [0, 1], col: 1 },
  { id: "m0", gate: "M", qubits: [0], col: 2 },
  { id: "m1", gate: "M", qubits: [1], col: 2 },
];

/**
 * Animated product preview: a live Bell-state circuit with traveling particles
 * and a real simulated probability readout. Loops automatically.
 */
export function HeroQuantum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const [outcome, setOutcome] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const { theme } = useTheme();

  // Loop: run a shot every ~2.6s
  useEffect(() => {
    const id = setInterval(() => {
      setRunning(true);
      setOutcome(null);
      setTimeout(() => {
        const { measuredBits } = runCircuit(HERO_OPS, 2);
        if (measuredBits) setOutcome(measuredBits[0] + measuredBits[1] * 2);
        setRunning(false);
      }, 900);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Particle field on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const particles = Array.from({ length: 36 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      hue: Math.random() < 0.5 ? "124,58,237" : "8,145,178",
      phase: Math.random() * Math.PI * 2,
    }));
    const alpha = theme === "dark" ? 0.25 : 0.18;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(Date.now() / 700 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * tw, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${alpha * tw})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  const pct = tick % 50; // subtle oscillation trigger for probability bars animation

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={420} height={300} className="absolute inset-0 h-full w-full opacity-70" />
      {/* window chrome */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-card2/90 shadow-card ">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-qx-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-qx-mint/70" />
          </div>
          <p className="font-mono text-xs text-ink-3">qubitx · quantum lab</p>
          <span className="rounded-md border border-accent/30 bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
            LIVE SIMULATION
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[1.3fr_1fr] sm:p-5">
          {/* circuit */}
          <div>
            <svg viewBox="0 0 240 110" className="w-full">
              <line x1="12" y1="30" x2="228" y2="30" stroke="var(--viz-wire)" strokeWidth="1.5" />
              <line x1="12" y1="80" x2="228" y2="80" stroke="var(--viz-wire)" strokeWidth="1.5" />
              <text x="9" y="34" fill="var(--viz-gate-text)" fontSize="10" fontFamily="monospace" textAnchor="end">q0</text>
              <text x="9" y="84" fill="var(--viz-measure-text)" fontSize="10" fontFamily="monospace" textAnchor="end">q1</text>

              {/* H gate */}
              <rect x="48" y="18" width="26" height="24" rx="4" fill="var(--viz-gate-bg)" stroke="var(--viz-gate-ring, #8b5cf6)" />
              <text x="61" y="34" fill="var(--viz-gate-text)" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="700">H</text>

              {/* CNOT */}
              <circle cx="112" cy="30" r="4" fill="var(--viz-dot)">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <line x1="112" y1="30" x2="112" y2="80" stroke="var(--viz-wire-strong)" strokeWidth="1.5" />
              <circle cx="112" cy="80" r="8" fill="var(--viz-measure-bg)" stroke="var(--viz-measure-ring)" strokeWidth="1.5" />
              <circle cx="112" cy="80" r="2.5" fill="var(--viz-measure-text)">
                <animate attributeName="r" values="2;3.5;2" dur="1.6s" repeatCount="indefinite" />
              </circle>

              {/* measurements */}
              <rect x="158" y="18" width="24" height="24" rx="4" fill="var(--viz-chip-bg)" stroke="var(--viz-chip-border)" />
              <text x="170" y="34" fill="var(--viz-chip-text)" fontSize="10" fontFamily="monospace" textAnchor="middle">M</text>
              <rect x="158" y="68" width="24" height="24" rx="4" fill="var(--viz-chip-bg)" stroke="var(--viz-chip-border)" />
              <text x="170" y="84" fill="var(--viz-chip-text)" fontSize="10" fontFamily="monospace" textAnchor="middle">M</text>

              {/* traveling particle on q0 */}
              <circle r="3.5" fill="var(--viz-gate-text)">
                <animateMotion dur="2.2s" repeatCount="indefinite" path="M12,30 L44,30" />
              </circle>
              <circle r="3.5" fill="var(--viz-gate-text)">
                <animateMotion dur="2.2s" begin="0.6s" repeatCount="indefinite" path="M76,30 L108,30" />
              </circle>
              <circle r="3.5" fill="var(--viz-dot)">
                <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path="M120,30 L154,30" />
              </circle>
              <circle r="3.5" fill="var(--viz-measure-text)">
                <animateMotion dur="2.2s" begin="0.3s" repeatCount="indefinite" path="M120,80 L154,80" />
              </circle>

              {/* result readout */}
              <g transform="translate(196, 12)">
                <rect width="32" height="22" rx="4" fill="var(--viz-chip-bg)" stroke="var(--viz-chip-border)" />
                {outcome === null ? (
                  <text x="16" y="15" fill="var(--viz-chip-text)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {running ? "…" : "?"}
                  </text>
                ) : (
                  <text x="16" y="15" fill={outcome === 0 ? "var(--viz-gate-text)" : "var(--viz-measure-text)"} fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="700">
                    {outcome === 0 ? "00" : "11"}
                  </text>
                )}
              </g>
            </svg>
            <p className="mt-2 font-mono text-[11px] text-ink-3">
              Bell state · H → CNOT · <span className="text-qx-cyan">measuring q0,q1</span>
            </p>
          </div>

          {/* probability readout */}
          <div className="space-y-2.5">
            {[0, 3].map((i) => {
              const p = i === 0 ? 50 : 50;
              const highlighted = outcome === i;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-11 shrink-0 text-right font-mono text-[11px] text-ink-2">
                    <Ket value={i} n={2} />
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-card2">
                    <div
                      className={`h-full rounded transition-all duration-700 ${highlighted ? "bg-qx-mint" : "bg-accent/80"}`}
                      style={{ width: `${p + (tick % 3)}%` }}
                    />
                  </div>
                  <span className="w-8 font-mono text-[11px] text-ink">{p}%</span>
                </div>
              );
            })}
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 opacity-40">
                <span className="w-11 shrink-0 text-right font-mono text-[11px] text-ink-3"><Ket value={i} n={2} /></span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-card2"><div className="h-full w-[2%] rounded bg-rose-500/50" /></div>
                <span className="w-8 font-mono text-[11px] text-ink-3">0%</span>
              </div>
            ))}
            <div className="rounded-lg border border-qx-cyan/20 bg-qx-cyan/5 px-3 py-2">
              <p className="text-[11px] leading-relaxed text-ink-2">
                q0 and q1 are <span className="text-qx-cyan">entangled</span> — they always agree.
              </p>
            </div>
          </div>
        </div>

        {/* status bar */}
        <div className="flex items-center justify-between border-t border-line bg-page/60 px-4 py-2">
          <span className="flex items-center gap-2 text-[11px] text-ink-3">
            <span className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-qx-amber" : "bg-qx-mint"}`} />
            {running ? "sampling a measurement…" : "ready · in-browser simulator"}
          </span>
          <span className="font-mono text-[11px] text-ink-3">2 qubits · 3 gates</span>
        </div>
      </div>
    </div>
  );
}