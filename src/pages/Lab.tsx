import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cpu, FlaskConical, Info } from "lucide-react";
import { CircuitBuilder } from "../components/lab/CircuitBuilder";
import { EmptyState, SectionHeading } from "../components/ui";
import { useStore } from "../lib/store";
import type { CircuitOp } from "../types";

export default function Lab() {
  const { currentUser, db } = useStore();
  const navigate = useNavigate();
  const [loadKey, setLoadKey] = useState(0);
  const [pendingLoad, setPendingLoad] = useState<{ ops: CircuitOp[]; qubits: number } | null>(null);

  const myExperiments = currentUser
    ? db.experiments.filter((e) => e.userId === currentUser.id)
    : [];

  const load = (ops: CircuitOp[], qubits: number) => {
    setPendingLoad({ ops: ops.map((o) => ({ ...o, id: crypto.randomUUID() })), qubits });
    setLoadKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Quantum Lab"
        title="Build. Run. Understand."
        sub="Pick a gate, click a wire, run the simulation. Every result is computed from real quantum mechanics in your browser — clearly labelled as simulated."
      />

      {!currentUser && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-qx-cyan/25 bg-qx-cyan/5 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-slate-300">
            <Info className="h-4 w-4 shrink-0 text-qx-cyan" />
            You're exploring as a guest — experiments won't be saved and no XP is earned.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-xl bg-qx-cyan/15 px-4 py-2 text-sm font-semibold text-qx-cyan hover:bg-qx-cyan/25"
          >
            Create free account
          </button>
        </div>
      )}

      <CircuitBuilder
        key={loadKey}
        initialOps={pendingLoad?.ops}
        initialQubits={pendingLoad?.qubits ?? 2}
      />

      {/* saved experiments */}
      <div className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <FlaskConical className="h-5 w-5 text-qx-violet" /> My experiments
          <span className="text-sm font-normal text-slate-500">({myExperiments.length})</span>
        </h2>
        {myExperiments.length === 0 ? (
          <EmptyState
            icon={<Cpu className="h-6 w-6" />}
            title="No experiments yet"
            body={currentUser
              ? "Build a circuit above and press Save to keep it here — you earn XP for every experiment."
              : "Sign in to save your circuits and track experiments."}
            action={
              !currentUser ? (
                <button onClick={() => navigate("/signup")} className="text-sm font-semibold text-qx-cyan hover:underline">
                  Create an account →
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myExperiments.map((exp) => (
              <div key={exp.id} className="rounded-2xl border border-white/10 bg-ink-850/80 p-5 transition hover:border-qx-violet/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{exp.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      {exp.numQubits} qubit{exp.numQubits > 1 ? "s" : ""} · {exp.circuit.length} gates
                    </p>
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400">
                    {new Date(exp.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                {exp.resultSummary && (
                  <p className="mt-2 font-mono text-xs text-qx-cyan">{exp.resultSummary}</p>
                )}
                <p className="mt-2 truncate font-mono text-xs text-slate-600">
                  {exp.circuit.map((o) => (o.gate === "CNOT" ? "CNOT" : o.gate)).join(" · ")}
                </p>
                <button
                  onClick={() => load(exp.circuit, exp.numQubits)}
                  className="mt-4 w-full rounded-xl border border-qx-violet/40 bg-qx-violet/10 py-2 text-sm font-semibold text-qx-violet transition hover:bg-qx-violet/20"
                >
                  Load into lab
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}