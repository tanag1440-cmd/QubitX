import React from "react";
import { AlertTriangle, CheckCircle2, Info, Sparkles, XCircle } from "lucide-react";
import type { GateType, TopicId } from "../../types";
import { Badge, Card, ProgressBar } from "../ui";
import { masteryBand } from "../../lib/learning/engine";
import { topicName } from "../../data/learningTopics";

// ── Topic mastery bar ────────────────────────────────────────────────────────

export function MasteryBar({
  topicId, mastery, attempts = 1, confidence, compact,
}: {
  topicId: TopicId; mastery: number; attempts?: number; confidence?: number; compact?: boolean;
}) {
  const band = masteryBand(mastery, attempts);
  const toneBar: Record<string, string> = {
    mint: "from-qx-mint to-qx-cyan",
    cyan: "from-qx-cyan to-qx-indigo",
    amber: "from-qx-amber to-qx-rose",
    rose: "from-qx-rose to-rose-600",
    slate: "from-slate-600 to-slate-500",
    violet: "from-qx-violet to-qx-indigo",
  };
  return (
    <div className={compact ? "" : "py-1"}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-ink">{topicName(topicId)}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-sm font-semibold text-ink">{mastery}%</span>
          <Badge color={band.tone}>{band.label}</Badge>
        </span>
      </div>
      <ProgressBar value={mastery} barClassName={`bg-gradient-to-r ${toneBar[band.tone]}`} />
      {!compact && (
        <p className="mt-1 text-[11px] text-ink-3">
          {attempts} attempt{attempts === 1 ? "" : "s"}
          {typeof confidence === "number" ? ` · confidence ${Math.round(confidence * 100)}%` : ""}
        </p>
      )}
    </div>
  );
}

// ── Static (non-interactive) circuit diagram ─────────────────────────────────

const WIRE_GAP = 38;
const COL_W = 54;

export function CircuitStatic({
  ops, numQubits, title,
}: {
  ops: { gate: GateType; qubits: number[] }[]; numQubits: number; title?: string;
}) {
  const height = 28 + numQubits * WIRE_GAP;
  const width = 56 + Math.max(1, ops.length) * COL_W;
  const wireY = (q: number) => 20 + q * WIRE_GAP;

  return (
    <div className="rounded-xl border border-line bg-card2/70 p-3">
      {title && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">{title}</p>}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[240px] w-full">
          {Array.from({ length: numQubits }).map((_, q) => (
            <line key={`w${q}`} x1={10} y1={wireY(q)} x2={width - 10} y2={wireY(q)} stroke="var(--viz-wire)" strokeWidth="1.5" />
          ))}
          {Array.from({ length: numQubits }).map((_, q) => (
            <text key={`l${q}`} x={8} y={wireY(q) + 4} fill="var(--viz-gate-text)" fontSize="11" fontFamily="monospace" textAnchor="end">
              q{q}
            </text>
          ))}
          {ops.map((op, i) => {
            const x = 44 + i * COL_W;
            if (op.gate === "CNOT") {
              const [ctrl, tgt] = op.qubits;
              const cy = wireY(ctrl);
              const ty = wireY(tgt);
              return (
                <g key={i}>
                  <line x1={x} y1={Math.min(cy, ty)} x2={x} y2={Math.max(cy, ty)} stroke="var(--viz-wire-strong)" strokeWidth="1.5" />
                  <circle cx={x} cy={cy} r={4} fill="var(--viz-dot)" />
                  <circle cx={x} cy={ty} r={9} fill="var(--viz-measure-bg)" stroke="var(--viz-measure-ring)" strokeWidth="1.5" />
                  <line x1={x - 6} y1={ty} x2={x + 6} y2={ty} stroke="var(--viz-measure-text)" strokeWidth="1.5" />
                  <line x1={x} y1={ty - 6} x2={x} y2={ty + 6} stroke="var(--viz-measure-text)" strokeWidth="1.5" />
                </g>
              );
            }
            if (op.gate === "SWAP") {
              const [a, b] = op.qubits;
              const ay = wireY(a);
              const by = wireY(b);
              return (
                <g key={i}>
                  <line x1={x} y1={Math.min(ay, by)} x2={x} y2={Math.max(ay, by)} stroke="var(--viz-wire-strong)" strokeWidth="1.5" />
                  <text x={x} y={ay + 5} fill="var(--viz-chip-text)" fontSize="14" textAnchor="middle">×</text>
                  <text x={x} y={by + 5} fill="var(--viz-chip-text)" fontSize="14" textAnchor="middle">×</text>
                </g>
              );
            }
            const y = wireY(op.qubits[0]) - 12;
            const measured = op.gate === "M";
            return (
              <g key={i}>
                <rect x={x - 13} y={y} width={26} height={24} rx={4}
                  fill={measured ? "var(--viz-chip-bg)" : "var(--viz-gate-bg)"}
                  stroke={measured ? "var(--viz-chip-border)" : "var(--viz-gate-ring, #8b5cf6)"} />
                <text x={x} y={y + 16} fill={measured ? "var(--viz-chip-text)" : "var(--viz-gate-text)"} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="700">
                  {op.gate}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Probability distribution bars ────────────────────────────────────────────

export function DistributionBars({
  probabilities, numQubits, emptyLabel = "Run the circuit to see the distribution.",
}: {
  probabilities: number[]; numQubits: number; emptyLabel?: string;
}) {
  const rows = probabilities.map((p, i) => ({
    label: `|${i.toString(2).padStart(numQubits, "0")}⟩`,
    p,
  }));
  const any = rows.some((r) => r.p > 0);
  if (!any) {
    return (
      <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-3">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-right font-mono text-sm text-ink-2">{r.label}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-card2">
            <div
              className="h-full rounded-md bg-accent transition-all duration-500"
              style={{ width: `${Math.max(r.p * 100, r.p > 0 ? 2 : 0)}%` }}
            />
          </div>
          <span className="w-16 shrink-0 font-mono text-sm text-ink">{(r.p * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Issue / feedback cards ───────────────────────────────────────────────────

export function IssueCard({ severity, title, children }: {
  severity: "high" | "medium" | "low"; title: string; children: React.ReactNode;
}) {
  const map = {
    high: { icon: <XCircle className="h-4 w-4" />, tone: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
    medium: { icon: <AlertTriangle className="h-4 w-4" />, tone: "border-qx-amber/30 bg-qx-amber/10 text-qx-amber" },
    low: { icon: <Info className="h-4 w-4" />, tone: "border-line bg-card2 text-ink-2" },
  }[severity];
  return (
    <div className={`rounded-xl border p-3.5 ${map.tone}`}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        {map.icon}<span>{title}</span>
      </p>
      <div className="mt-2 space-y-1.5 text-sm text-ink-2">{children}</div>
    </div>
  );
}

export function FeedbackBanner({ correct, headline, detail, hint }: {
  correct: boolean; headline: string; detail: string; hint?: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${correct ? "border-qx-mint/30 bg-qx-mint/10" : "border-qx-amber/30 bg-qx-amber/10"}`}>
      <p className={`flex items-center gap-2 font-semibold ${correct ? "text-qx-mint" : "text-qx-amber"}`}>
        {correct ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Sparkles className="h-4.5 w-4.5" />}
        {headline}
      </p>
      <p className="mt-2 text-sm text-ink-2">{detail}</p>
      {hint && <p className="mt-2 text-sm text-ink-2"><span className="font-semibold text-ink-2">Hint: </span>{hint}</p>}
    </div>
  );
}

// ── AI attribution chip ──────────────────────────────────────────────────────

export function GroundedChip({ label = "Grounded in your data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-qx-cyan/30 bg-qx-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-qx-cyan">
      <Sparkles className="h-3 w-3" /> {label}
    </span>
  );
}

export function ComingSoon({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-dashed border-line bg-card2/50 p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-card2 p-2 text-ink-2"><Info className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-semibold text-ink">Coming soon</p>
          <p className="mt-1 text-sm text-ink-2">{children}</p>
        </div>
      </div>
    </Card>
  );
}
