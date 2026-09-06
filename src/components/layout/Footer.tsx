import React from "react";
import { Link } from "react-router-dom";
import { Atom } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-qx-violet to-qx-cyan">
                <Atom className="h-4.5 w-4.5 text-white" />
              </span>
              <span className="font-bold text-white">
                Qubit<span className="text-qx-cyan">X</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Learn. Simulate. Experiment. Understand Quantum. — An interactive platform for learning quantum
              computing from first principles, no hardware required.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Learn</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/learn" className="hover:text-white">Lessons</Link></li>
                <li><Link to="/visualize" className="hover:text-white">Visualize</Link></li>
                <li><Link to="/algorithms" className="hover:text-white">Algorithms</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Practice</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/lab" className="hover:text-white">Quantum Lab</Link></li>
                <li><Link to="/challenges" className="hover:text-white">Challenges</Link></li>
                <li><Link to="/tutor" className="hover:text-white">AI Tutor</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">More</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/resources" className="hover:text-white">Resources</Link></li>
                <li><Link to="/progress" className="hover:text-white">Progress</Link></li>
                <li><Link to="/achievements" className="hover:text-white">Achievements</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-slate-600">
          QubitX · Built for Smart India Hackathon · All simulations run locally in your browser
        </div>
      </div>
    </footer>
  );
}