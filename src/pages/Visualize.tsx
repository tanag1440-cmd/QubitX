import React, { lazy, Suspense, useState } from "react";
import {
  Binary, CircleDot, Eye, Link2, Orbit, Sparkles, Waves, X,
} from "lucide-react";
import { LessonDemo } from "../components/viz";
import { Badge, Card, SectionHeading } from "../components/ui";
import { Ket } from "../components/quantum/display";

// three.js is heavy — lazy-load it
const BlochSphere = lazy(() => import("../components/viz3d/BlochSphere").then((m) => ({ default: m.BlochSphere })));

const CONCEPTS = [
  {
    id: "qubit", title: "Qubit", icon: <CircleDot className="h-5 w-5" />, demo: "qubit-visual", color: "violet",
    blurb: "A qubit is a blend of |0⟩ and |1⟩. See the difference from a classical bit.",
  },
  {
    id: "superposition", title: "Superposition", icon: <Waves className="h-5 w-5" />, demo: "superposition-demo", color: "cyan",
    blurb: "Drag the probabilities, then measure. Watch statistics follow the weights.",
  },
  {
    id: "measurement", title: "Measurement", icon: <Eye className="h-5 w-5" />, demo: "measurement-demo", color: "amber",
    blurb: "The act of looking collapses a superposition — and locks in the answer.",
  },
  {
    id: "entanglement", title: "Entanglement", icon: <Link2 className="h-5 w-5" />, demo: "entanglement-demo", color: "rose",
    blurb: "Two qubits that always agree. Measure one, the other is decided — instantly.",
  },
  {
    id: "gates", title: "Quantum Gates", icon: <Binary className="h-5 w-5" />, demo: "gate-playground", color: "mint",
    blurb: "Apply H, X, Y, Z, S, T to a real simulated qubit and watch it transform.",
  },
  {
    id: "interference", title: "Interference", icon: <Sparkles className="h-5 w-5" />, demo: "interference-demo", color: "indigo",
    blurb: "Why wrong answers cancel: amplitude arithmetic behind H · H = identity.",
  },
];

const COLOR_MAP: Record<string, string> = {
  violet: "text-qx-violet bg-qx-violet/10 border-qx-violet/40",
  cyan: "text-qx-cyan bg-qx-cyan/10 border-qx-cyan/40",
  amber: "text-qx-amber bg-qx-amber/10 border-qx-amber/40",
  rose: "text-qx-rose bg-qx-rose/10 border-qx-rose/40",
  mint: "text-qx-mint bg-qx-mint/10 border-qx-mint/40",
  indigo: "text-indigo-300 bg-indigo-400/10 border-indigo-400/40",
};

export default function Visualize() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = CONCEPTS.find((c) => c.id === selected);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Visualize"
        title="See Quantum, Don't Just Read It"
        sub="Every concept below is a live, interactive simulation — click a card to open it right here."
      />

      {/* Bloch sphere featured */}
      <Card className="mb-10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-ink-950/60 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Orbit className="h-5 w-5 text-qx-cyan" /> 3D Bloch Sphere Explorer
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Every possible single-qubit state is a point on this sphere. Gates rotate the state vector — try it.
            </p>
          </div>
          <Badge color="cyan"><Ket value={0} /> north pole · <Ket value={1} /> south pole</Badge>
        </div>
        <div className="p-6">
          <Suspense fallback={<div className="flex h-72 items-center justify-center text-sm text-slate-500">Loading 3D view…</div>}>
            <BlochSphere />
          </Suspense>
        </div>
      </Card>

      {/* concept cards */}
      <h2 className="mb-4 text-lg font-bold text-white">Concept visualizers</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONCEPTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(selected === c.id ? null : c.id)}
            className={`rounded-2xl border p-5 text-left transition ${
              selected === c.id
                ? `${COLOR_MAP[c.color]} shadow-glow`
                : "border-white/10 bg-ink-850/80 hover:border-white/25 hover:bg-ink-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected === c.id ? "bg-white/15" : "bg-white/5 text-slate-300"}`}>
                {c.icon}
              </span>
              <h3 className="font-semibold text-white">{c.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.blurb}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              {selected === c.id ? "Close ▲" : "Open interactive demo ▼"}
            </p>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-8 animate-fade-up rounded-2xl border border-white/10 bg-ink-900/40 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${COLOR_MAP[active.color]}`}>{active.icon}</span>
              {active.title}
            </h3>
            <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close demo">
              <X className="h-5 w-5" />
            </button>
          </div>
          <LessonDemo id={active.demo} />
        </div>
      )}
    </div>
  );
}