import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Lock, Swords, Trophy, Zap } from "lucide-react";
import { CircuitBuilder } from "../components/lab/CircuitBuilder";
import { Badge, Button, Card, SectionHeading } from "../components/ui";
import { CHALLENGES } from "../data/content";
import { useStore } from "../lib/store";
import type { CircuitOp } from "../types";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Challenges() {
  const { currentUser, db, solveChallenge, recordActivity } = useStore();
  const navigate = useNavigate();

  const today = todayKey();
  const todays = CHALLENGES.find((c) => c.date === today) ?? CHALLENGES[0];
  const upcoming = CHALLENGES.filter((c) => c.id !== todays.id).slice(0, 2);

  const awardedRef = useRef(false);

  const alreadySolved = Boolean(
    currentUser && db.challengeAttempts.some((a) => a.userId === currentUser.id && a.challengeId === todays.id && a.success)
  );

  const evaluator = (ops: CircuitOp[], numQubits: number) => {
    if (!currentUser) return null;
    const gates = ops
      .slice()
      .sort((a, b) => a.col - b.col)
      .filter((o) => o.gate !== "M")
      .map((o) => ({ gate: o.gate, qubits: o.qubits }));
    const target = todays.targetCircuit;
    const pass = gates.length === target.length && gates.every((g, i) => g.gate === target[i].gate && g.qubits.join() === target[i].qubits.join());
    return {
      pass,
      message: pass
        ? "Your circuit matches the goal. Great work!"
        : `Needs a circuit equivalent to: ${target.map((t) => (t.gate === "CNOT" ? `CNOT(q${t.qubits[0]}→q${t.qubits[1]})` : `${t.gate} on q${t.qubits[0]}`)).join(", ")}. Build it above and run it.`,
    };
  };

  const onRun = (ops: CircuitOp[], numQubits: number) => {
    if (!currentUser) return;
    const gates = ops.filter((o) => o.gate !== "M").map((o) => ({ gate: o.gate, qubits: o.qubits }));
    const target = todays.targetCircuit;
    const pass = gates.length === target.length && gates.every((g, i) => g.gate === target[i].gate && g.qubits.join() === target[i].qubits.join());
    if (pass && !awardedRef.current && !alreadySolved) {
      awardedRef.current = true;
      solveChallenge(todays.id, true);
    }
    recordActivity();
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Swords className="mx-auto mb-4 h-12 w-12 text-qx-violet" />
        <h1 className="text-2xl font-bold text-white">Daily Quantum Challenges</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Build circuits that satisfy a goal, get them checked automatically, and earn XP.
          Log in or create a free account to take today's challenge.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/login")}>Log in</Button>
          <Button variant="secondary" onClick={() => navigate("/signup")}>Create account</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Challenges"
        title="Daily Quantum Challenge"
        sub="A small circuit puzzle every day. Build it in the lab, run it, and the checker tells you instantly — solve it for XP."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-qx-violet/15 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-qx-violet/20 text-qx-violet">
              <Swords className="h-5.5 w-5.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white">{todays.title}</h2>
                {alreadySolved && <Badge color="mint"><CheckCircle2 className="h-3 w-3" /> Solved</Badge>}
              </div>
              <p className="text-sm text-slate-400">{todays.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color="amber"><Zap className="h-3 w-3" /> +{todays.xpReward} XP</Badge>
            <Badge color="slate">{todays.numQubits} qubit{todays.numQubits > 1 ? "s" : ""}</Badge>
          </div>
        </div>
        <div className="p-6">
          <CircuitBuilder
            key={todays.id}
            initialQubits={todays.numQubits}
            maxQubits={3}
            embedded
            evaluator={evaluator}
            onRun={onRun}
          />
        </div>
      </Card>

      {/* upcoming */}
      <div className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          <CalendarDays className="h-4 w-4" /> More challenges coming up
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {upcoming.map((c) => {
            const done = db.challengeAttempts.some((a) => a.userId === currentUser.id && a.challengeId === c.id && a.success);
            return (
              <Card key={c.id} className="flex items-center gap-4 p-5 opacity-80">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-500">
                  {done ? <CheckCircle2 className="h-5 w-5 text-qx-mint" /> : <Lock className="h-5 w-5" />}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(c.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{c.description}</p>
                </div>
                <Badge color={done ? "mint" : "amber"}><Trophy className="h-3 w-3" /> {c.xpReward} XP</Badge>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}