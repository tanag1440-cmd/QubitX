import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Compass, MapPin } from "lucide-react";
import { Card } from "../ui";

const STEPS = [
  { label: "Learn a concept", to: "/learn", match: (p: string) => p.startsWith("/learn/") || p === "/learn", hint: "Open a lesson — try Module 3: Superposition" },
  { label: "Visualize superposition", to: "/visualize", match: (p: string) => p === "/visualize", hint: "Visualize tab → Superposition card" },
  { label: "Build a circuit", to: "/lab", match: (p: string) => p === "/lab", hint: "Quantum Lab — place H and CNOT on wires" },
  { label: "Run the circuit", to: "/lab", match: (p: string) => p === "/lab", hint: "Press Run Circuit; read the distribution" },
  { label: "Ask the AI Tutor", to: "/tutor", match: (p: string) => p === "/tutor", hint: "\"Explain superposition like I'm 10\"" },
  { label: "Take a quiz", to: "/learn/l3", match: (p: string) => p === "/learn/l3" || p === "/learn/l6", hint: "Scroll to the bottom of any lesson" },
  { label: "View progress", to: "/progress", match: (p: string) => p === "/progress", hint: "Charts, XP, and the skill map" },
];

export function DemoGuide() {
  const { pathname } = useLocation();
  const doneCount = STEPS.filter((s) => s.match(pathname)).length;

  return (
    <Card className="overflow-hidden border-qx-cyan/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-qx-cyan/15 to-qx-violet/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-qx-cyan/20 text-qx-cyan">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-white">You're in Demo Mode</h2>
            <p className="text-sm text-slate-400">
              Sample learner loaded with progress, circuits, and badges. Follow the tour to see the full journey.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-qx-cyan">{doneCount}/{STEPS.length} steps</span>
      </div>

      <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const done = s.match(pathname);
          return (
            <Link
              key={i}
              to={s.to}
              className={`rounded-xl border p-3.5 transition ${
                done ? "border-qx-mint/40 bg-qx-mint/10" : "border-white/10 bg-white/[0.03] hover:border-qx-cyan/50 hover:bg-qx-cyan/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-950 font-mono text-[10px] font-bold text-qx-cyan">
                  {done ? <CheckCircle2 className="h-4 w-4 text-qx-mint" /> : i + 1}
                </span>
                <span className={`text-sm font-semibold ${done ? "text-qx-mint" : "text-white"}`}>{s.label}</span>
              </span>
              <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">{s.hint}</span>
            </Link>
          );
        })}
        <div className="flex flex-col justify-between rounded-xl border border-qx-violet/30 bg-qx-violet/10 p-4">
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-300">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-qx-violet" />
            Finish by checking Achievements, your Profile, and the Admin panel.
          </p>
          <Link
            to="/achievements"
            className="mt-2 self-start rounded-lg bg-qx-violet/20 px-3 py-1.5 text-xs font-semibold text-qx-violet hover:bg-qx-violet/30"
          >
            See achievements →
          </Link>
        </div>
      </div>
    </Card>
  );
}