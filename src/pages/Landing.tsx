import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Atom, Binary, Bot, Brain, CheckCircle2, CircleDot, Compass,
  Cpu, Eye, FlaskConical, GitBranch, GraduationCap, Link2, Rocket,
  Sparkles, Trophy, Waves, Wrench, Zap,
} from "lucide-react";
import { HeroQuantum } from "../components/landing/HeroQuantum";
import { Ket } from "../components/quantum/display";
import { Badge, Button, Card, LinkButton, SectionHeading } from "../components/ui";
import { useStore } from "../lib/store";

const PROBLEMS = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Abstract concepts",
    body: "Superposition and entanglement can't be seen or touched. Textbook formulas leave most learners guessing at what's actually happening.",
  },
  {
    icon: <Binary className="h-5 w-5" />,
    title: "Mathematical complexity",
    body: "Most resources start with linear algebra and complex numbers — before you've ever seen a qubit do anything.",
  },
  {
    icon: <FlaskConical className="h-5 w-5" />,
    title: "No practical experimentation",
    body: "You can't 'try' quantum mechanics on a whiteboard. Without interactivity, ideas stay abstract forever.",
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: "Limited access to hardware",
    body: "Real quantum computers are rare, expensive, and behind queues. Most learners never touch one.",
  },
];

const FEATURES = [
  { icon: <GraduationCap className="h-5 w-5" />, title: "Interactive lessons", body: "10 guided modules with real demos embedded in every concept." },
  { icon: <Cpu className="h-5 w-5" />, title: "Quantum simulator", body: "A real state-vector simulator running in your browser — no hardware needed." },
  { icon: <Bot className="h-5 w-5" />, title: "AI tutor", body: "Qubit Tutor explains any concept simply, with analogies on demand." },
  { icon: <GitBranch className="h-5 w-5" />, title: "Quantum lab", body: "Drag gates onto qubits, run circuits, and read honest probability distributions." },
  { icon: <Brain className="h-5 w-5" />, title: "Quizzes & challenges", body: "Instant-feedback quizzes and a daily challenge that checks your circuits." },
  { icon: <Trophy className="h-5 w-5" />, title: "Progress tracking", body: "XP, streaks, achievements, and a skill map that shows growth." },
];

const DEMO_GATES = [
  { label: "H", color: "text-qx-violet border-qx-violet/50 bg-qx-violet/10" },
  { label: "X", color: "text-qx-cyan border-qx-cyan/50 bg-qx-cyan/10" },
  { label: "Y", color: "text-qx-mint border-qx-mint/50 bg-qx-mint/10" },
  { label: "Z", color: "text-qx-amber border-qx-amber/50 bg-qx-amber/10" },
];

const FLOW = ["LEARN", "VISUALIZE", "EXPERIMENT", "SIMULATE", "UNDERSTAND", "TEST", "TRACK"];

export default function Landing() {
  const navigate = useNavigate();
  const { enterDemo } = useStore();

  const startDemo = () => {
    enterDemo();
    navigate("/dashboard");
  };

  return (
    <div className="quantum-bg">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <Badge color="violet" className="mb-5">
              <Zap className="h-3 w-3" /> Smart India Hackathon 2026
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
              Quantum Computing,{" "}
              <span className="bg-gradient-to-r from-qx-violet via-qx-indigo to-qx-cyan bg-clip-text text-transparent">
                Made Understandable.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
              Learn quantum computing through interactive simulations, visual experiments, guided lessons,
              and AI-powered explanations.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton to="/signup" size="lg">
                Start Learning <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <Button variant="secondary" size="lg" onClick={() => navigate("/lab")}>
                Explore Quantum Lab
              </Button>
              <button
                onClick={startDemo}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-qx-cyan hover:text-qx-cyan/80"
              >
                <Compass className="h-4 w-4" />
                Explore Demo
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-qx-mint" /> 100% in-browser</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-qx-mint" /> No hardware required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-qx-mint" /> Beginner friendly</span>
            </div>
          </div>

          <div className="animate-fade-up lg:justify-self-end">
            <HeroQuantum />
          </div>
        </div>
      </section>

      {/* ── Why it's hard ────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            center
            eyebrow="The problem"
            title="Why Quantum Learning Is Difficult"
            sub="Quantum computing is the most important computing shift in decades — and the hardest to learn. Here's why."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEMS.map((p) => (
              <Card key={p.title} className="p-6">
                <div className="mb-4 inline-flex rounded-xl bg-rose-500/10 p-2.5 text-rose-400">{p.icon}</div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── One platform ─────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            center
            eyebrow="The solution"
            title="One Platform. Complete Quantum Learning."
            sub="Everything a beginner needs to go from 'what is a qubit?' to running real circuits — in one place."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="group p-6 transition hover:border-qx-violet/40">
                <div className="mb-4 inline-flex rounded-xl bg-qx-violet/10 p-2.5 text-qx-violet transition group-hover:shadow-glow">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learn by doing ───────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Learn by doing"
                title="Build a circuit before you learn the math"
                sub="Every concept in QubitX comes with a hands-on experiment. Here's a real circuit you'll build in your first session — H creates superposition, CNOT entangles, measurement reads the answer."
              />
              <div className="flex flex-wrap gap-2">
                {DEMO_GATES.map((g) => (
                  <span key={g.label} className={`flex h-11 w-11 items-center justify-center rounded-xl border font-mono text-base font-bold ${g.color}`}>
                    {g.label}
                  </span>
                ))}
                <span className="flex h-11 items-center gap-1.5 rounded-xl border border-qx-cyan/50 bg-qx-cyan/10 px-3 font-mono text-xs font-bold text-qx-cyan">
                  CNOT
                </span>
                <span className="flex h-11 items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 font-mono text-xs font-bold text-slate-300">
                  M
                </span>
              </div>
              <div className="mt-6">
                <Button size="lg" onClick={() => navigate("/lab")}>
                  Try it in the Quantum Lab <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* example circuit card */}
            <Card className="overflow-hidden">
              <div className="border-b border-white/5 bg-ink-950/60 px-4 py-2.5 font-mono text-xs text-slate-500">
                bell-state.qx — a working circuit
              </div>
              <div className="p-6">
                <svg viewBox="0 0 280 110" className="w-full">
                  <line x1="14" y1="30" x2="266" y2="30" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                  <line x1="14" y1="80" x2="266" y2="80" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                  <text x="11" y="34" fill="#a78bfa" fontSize="11" fontFamily="monospace" textAnchor="end">q0</text>
                  <text x="11" y="84" fill="#67e8f9" fontSize="11" fontFamily="monospace" textAnchor="end">q1</text>
                  <rect x="52" y="18" width="28" height="24" rx="4" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" />
                  <text x="66" y="35" fill="#c4b5fd" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="700">H</text>
                  <circle cx="122" cy="30" r="4.5" fill="#e2e8f0" />
                  <line x1="122" y1="30" x2="122" y2="80" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                  <circle cx="122" cy="80" r="9" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="1.5" />
                  <circle cx="122" cy="80" r="3" fill="#67e8f9" />
                  <rect x="176" y="18" width="28" height="24" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" />
                  <text x="190" y="35" fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">M</text>
                  <rect x="176" y="68" width="28" height="24" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" />
                  <text x="190" y="85" fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">M</text>
                </svg>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-ink-950/60 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">Result distribution</p>
                    <p className="mt-1 font-mono text-sm text-white">
                      <Ket value={0} n={2} /> <span className="text-qx-violet">50%</span> · <Ket value={3} n={2} /> <span className="text-qx-cyan">50%</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-ink-950/60 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">What happened?</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      H made q0 a 50/50 blend; CNOT entangled q1 to it. The qubits always agree.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── No hardware needed ───────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-qx-violet/25 bg-gradient-to-br from-ink-850 via-ink-900 to-ink-850">
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <Badge color="mint" className="mb-4"><Cpu className="h-3 w-3" /> No hardware? No problem.</Badge>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Don't have access to a quantum computer? Start here.
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-slate-400">
                  QubitX ships with a genuine state-vector simulator that runs entirely in your browser.
                  It computes the real mathematics of quantum mechanics — complex amplitudes, gate
                  transformations, and measurement sampling — and every result is clearly labelled{" "}
                  <span className="font-semibold text-qx-cyan">Simulated</span>.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Build and run circuits instantly — no queues, no credits",
                    "Understand the exact math behind every gate",
                    "The same skills transfer directly to real cloud quantum APIs",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-qx-mint" /> {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <LinkButton to="/lab" variant="secondary" size="lg">
                    Open the Quantum Lab <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Atom className="h-4 w-4" />, v: "2ⁿ", l: "states simulated" },
                  { icon: <Waves className="h-4 w-4" />, v: "7", l: "core gates" },
                  { icon: <Eye className="h-4 w-4" />, v: "100%", l: "in-browser" },
                  { icon: <Link2 className="h-4 w-4" />, v: "0", l: "hardware needed" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/10 bg-ink-950/60 p-5 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-qx-cyan/10 text-qx-cyan">{s.icon}</div>
                    <p className="font-mono text-2xl font-bold text-white">{s.v}</p>
                    <p className="mt-1 text-xs text-slate-500">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Journey flow ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            center
            eyebrow="Your journey"
            title="From first qubit to quantum fluency"
          />
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {FLOW.map((f, i) => (
              <React.Fragment key={f}>
                <span className="rounded-xl border border-qx-violet/30 bg-qx-violet/10 px-3.5 py-2 text-xs font-bold tracking-wide text-qx-violet sm:text-sm">
                  {f}
                </span>
                {i < FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-slate-600" />}
              </React.Fragment>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-slate-400">
            Every lesson ends in an experiment. Every experiment teaches a concept. Every quiz locks it in —
            and your dashboard tracks the whole journey with XP, streaks, and achievements.
          </p>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-qx-violet to-qx-cyan shadow-glow">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start Your Quantum Journey
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Create a free account and run your first circuit in under five minutes. No math prerequisites.
            No hardware. Just curiosity.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton to="/signup" size="lg">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <button
              onClick={startDemo}
              className="inline-flex items-center gap-2 rounded-xl border border-qx-cyan/40 bg-qx-cyan/10 px-6 py-3 text-base font-semibold text-qx-cyan transition hover:bg-qx-cyan/20"
            >
              <CircleDot className="h-4 w-4" /> Explore Demo
            </button>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Demo mode instantly loads a sample learner with progress, circuits, and achievements — perfect for exploring.
          </p>
        </div>
      </section>
    </div>
  );
}