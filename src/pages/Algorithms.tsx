import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FunctionSquare, KeyRound, Package, Search, Send, Zap } from "lucide-react";
import { Badge, Card, SectionHeading } from "../components/ui";
import { ALGORITHMS } from "../data/algorithms";

const ICONS: Record<string, React.ReactNode> = {
  FunctionSquare: <FunctionSquare className="h-5 w-5" />,
  Search: <Search className="h-5 w-5" />,
  Send: <Send className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  KeyRound: <KeyRound className="h-5 w-5" />,
};

export default function Algorithms() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Algorithm Explorer"
        title="The Algorithms That Make Quantum Computing Matter"
        sub="Five landmark algorithms, explained step by step — with real simulations you can run right here. No black boxes: every result comes from actual quantum state mathematics."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {ALGORITHMS.map((a) => (
          <Card key={a.id} className="group flex flex-col p-6 transition hover:border-qx-violet/40 ">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-qx-violet/15 text-qx-violet">
                  {ICONS[a.icon] ?? <Zap className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">{a.title}</h3>
                  <p className="text-xs text-ink-3">{a.tagline}</p>
                </div>
              </div>
              <Badge color={a.level === "Beginner" ? "mint" : "amber"}>{a.level}</Badge>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-page/60 p-3">
              {a.circuit}
            </div>
            <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-2">{a.problem}</p>
            <button
              onClick={() => navigate(`/algorithms/${a.id}`)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              Explore & run simulation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-qx-amber/25 bg-qx-amber/5 p-6 text-center">
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-qx-amber">Beginner?</span> Start with the Learn path — algorithms are
          Module 8 — or read the explanations here and run the simulations without any math prerequisites.
        </p>
      </div>
    </div>
  );
}