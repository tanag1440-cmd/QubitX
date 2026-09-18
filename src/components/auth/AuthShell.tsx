import React from "react";
import { Link } from "react-router-dom";
import { Atom } from "lucide-react";
import { Card } from "../ui";

export function AuthShell({ title, sub, children, footer }: {
  title: string; sub: string; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="quantum-bg flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Atom className="h-5.5 w-5.5 text-white" />
            </span>
            <span className="text-xl font-bold text-ink">
              Qubit<span className="text-accent">X</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink-2">{sub}</p>
        </div>
        <Card className="p-6 sm:p-8">{children}</Card>
        <div className="mt-5 text-center text-sm text-ink-2">{footer}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-card2/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-qx-violet/60 focus:outline-none focus:ring-2 focus:ring-qx-violet/20 transition";