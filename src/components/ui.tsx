import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

// ── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong border border-transparent",
  secondary:
    "bg-card2 text-ink border border-line-strong hover:bg-line hover:border-line-strong",
  ghost: "text-ink-2 hover:text-ink hover:bg-card2",
  danger: "bg-err/10 text-err border border-err/30 hover:bg-err/20",
  success: "bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", ...rest }: ButtonProps) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${sizes[size]} ${buttonStyles[variant]} ${className}`}
      {...rest}
    />
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-line bg-card shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────

const badgeColors: Record<string, string> = {
  violet: "bg-qx-violet/10 text-qx-violet border-qx-violet/30",
  cyan: "bg-qx-cyan/10 text-qx-cyan border-qx-cyan/30",
  mint: "bg-qx-mint/10 text-qx-mint border-qx-mint/30",
  amber: "bg-qx-amber/10 text-qx-amber border-qx-amber/30",
  rose: "bg-qx-rose/10 text-qx-rose border-qx-rose/30",
  slate: "bg-card2 text-ink-2 border-line-strong",
};

export function Badge({ color = "slate", children, className = "" }: { color?: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeColors[color] ?? badgeColors.slate} ${className}`}>
      {children}
    </span>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, className = "", barClassName = "" }: { value: number; className?: string; barClassName?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-card2 ${className}`}>
      <div
        className={`h-full rounded-full bg-accent transition-all duration-500 ${barClassName}`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({ icon, label, value, sub, accent = "violet" }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; accent?: string;
}) {
  const accents: Record<string, string> = {
    violet: "text-qx-violet bg-qx-violet/10",
    cyan: "text-qx-cyan bg-qx-cyan/10",
    mint: "text-qx-mint bg-qx-mint/10",
    amber: "text-qx-amber bg-qx-amber/10",
    rose: "text-qx-rose bg-qx-rose/10",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-3">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-2">{sub}</p>}
        </div>
        <div className={`shrink-0 rounded-lg p-2.5 ${accents[accent] ?? accents.violet}`}>{icon}</div>
      </div>
    </Card>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────

export function SectionHeading({ eyebrow, title, sub, center }: {
  eyebrow?: string; title: string; sub?: string; center?: boolean;
}) {
  return (
    <div className={`mb-8 ${center ? "text-center mx-auto max-w-2xl" : ""}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">{title}</h2>
      {sub && <p className="mt-3 text-ink-2 leading-relaxed">{sub}</p>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} animate-fade-up rounded-xl border border-line bg-card p-6 shadow-panel`}>
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-bold text-ink">{title}</h3>}
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-3 hover:bg-card2 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, body, action }: {
  icon: React.ReactNode; title: string; body: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-card2/50 px-6 py-14 text-center">
      <div className="mb-4 rounded-xl bg-card2 p-4 text-ink-3">{icon}</div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-2">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Link button style helper ─────────────────────────────────────────────────

export function LinkButton({ to, variant = "primary", size = "md", className = "", children }: {
  to: string; variant?: ButtonVariant; size?: "sm" | "md" | "lg"; className?: string; children: React.ReactNode;
}) {
  const sizes = { sm: "px-3 py-1.5 text-sm rounded-lg", md: "px-4 py-2 text-sm rounded-lg", lg: "px-6 py-3 text-base rounded-lg" };
  return (
    <Link to={to} className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 ${sizes[size]} ${buttonStyles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
