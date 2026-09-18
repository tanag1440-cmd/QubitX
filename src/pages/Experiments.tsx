import React, { useMemo, useState } from "react";
import { Beaker, GitCompare, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Badge, Button, Card, LinkButton, SectionHeading } from "../components/ui";
import { CircuitStatic, DistributionBars, GroundedChip } from "../components/learning";
import { compareCircuits } from "../lib/learning/aiService";
import { analyzeCircuit } from "../lib/learning/engine";
import { useStore } from "../lib/store";
import { useRegisterPageContext } from "../lib/tutorContext";
import type { CircuitOp, GateType } from "../types";

interface BaseCircuit {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  ops: { gate: GateType; qubits: number[] }[];
}

const BASES: BaseCircuit[] = [
  {
    id: "bell", name: "Bell state", description: "H then CNOT — the canonical entangled pair.",
    numQubits: 2,
    ops: [{ gate: "H", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }],
  },
  {
    id: "superposition", name: "Superposition", description: "A single H on q0.",
    numQubits: 1, ops: [{ gate: "H", qubits: [0] }],
  },
  {
    id: "interference", name: "Interference", description: "Two H gates that cancel (H·H = I).",
    numQubits: 1, ops: [{ gate: "H", qubits: [0] }, { gate: "H", qubits: [0] }],
  },
  {
    id: "ghz", name: "GHZ state", description: "Three-qubit all-or-nothing entanglement.",
    numQubits: 3,
    ops: [{ gate: "H", qubits: [0] }, { gate: "CNOT", qubits: [0, 1] }, { gate: "CNOT", qubits: [0, 2] }],
  },
  {
    id: "x-measure", name: "Flip & measure", description: "X on q0, then measure.",
    numQubits: 1, ops: [{ gate: "X", qubits: [0] }, { gate: "M", qubits: [0] }],
  },
];

interface Modification { id: string; label: string; apply: (ops: CircuitOp[]) => CircuitOp[]; }

function toOps(circuit: { gate: GateType; qubits: number[] }[]): CircuitOp[] {
  return circuit.map((o, i) => ({ id: `${o.gate}-${i}`, gate: o.gate, qubits: o.qubits, col: i }));
}

const gateLabel = (o: { gate: GateType; qubits: number[] }) =>
  o.gate === "CNOT" || o.gate === "SWAP"
    ? `${o.gate}(${o.qubits.join(",")})`
    : `${o.gate}(q${o.qubits[0] ?? 0})`;

function buildModifications(ops: CircuitOp[]): Modification[] {
  const mods: Modification[] = [];
  ops.forEach((o, i) => {
    const label = o.gate === "CNOT" ? `CNOT(q${o.qubits[0]}→q${o.qubits[1]})` : `${o.gate}(q${o.qubits[0]})`;
    mods.push({
      id: `remove-${i}`,
      label: `Remove ${label}`,
      apply: (list) => list.filter((_, j) => j !== i),
    });
    if (o.gate === "CNOT") {
      mods.push({
        id: `reverse-${i}`,
        label: `Reverse ${label} (control ↔ target)`,
        apply: (list) => list.map((x, j) => (j === i ? { ...x, qubits: [x.qubits[1], x.qubits[0]] } : x)),
      });
      mods.push({
        id: `extra-h-${i}`,
        label: `Add an H before ${label}`,
        apply: (list) => [
          ...list.slice(0, i),
          { id: `extra-h-${i}`, gate: "H" as GateType, qubits: [o.qubits[1]], col: o.col },
          ...list.slice(i),
        ],
      });
    }
  });
  mods.push({
    id: "add-z",
    label: "Add a Z gate at the end on q0",
    apply: (list) => [...list, { id: "add-z", gate: "Z" as GateType, qubits: [0], col: (list.length ? list[list.length - 1].col : 0) + 1 }],
  });
  mods.push({
    id: "swap-h-x",
    label: "Replace every H with an X",
    apply: (list) => list.map((x) => (x.gate === "H" ? { ...x, gate: "X" as GateType } : x)),
  });
  if (ops.some((o) => o.gate === "M")) {
    mods.push({ id: "remove-measure", label: "Remove all measurements", apply: (list) => list.filter((x) => x.gate !== "M") });
  }
  return mods;
}

export default function Experiments() {
  const { recordActivity } = useStore();
  const [baseId, setBaseId] = useState(BASES[0].id);
  const [modId, setModId] = useState<string | null>(null);

  const base = BASES.find((b) => b.id === baseId)!;
  const originalOps = useMemo(() => toOps(base.ops), [base]);
  const mods = useMemo(() => buildModifications(originalOps), [originalOps]);
  const modification = mods.find((m) => m.id === modId) ?? null;

  const modifiedOps = useMemo(() => (modification ? modification.apply(originalOps) : null), [modification, originalOps]);

  const comparison = useMemo(() => {
    if (!modifiedOps) return null;
    return compareCircuits(
      { ops: originalOps, numQubits: base.numQubits },
      { ops: modifiedOps, numQubits: base.numQubits },
      modification!.label
    );
  }, [modifiedOps, originalOps, base.numQubits, modification]);

  // Publish both sides of the comparison so "explain what changed" is grounded.
  useRegisterPageContext({
    kind: "experiment",
    title: "Experiment Mode",
    circuit: { ops: modification && modifiedOps ? modifiedOps : originalOps, numQubits: base.numQubits },
    facts: [
      `Base circuit “${base.name}” (${base.numQubits} qubit${base.numQubits === 1 ? "" : "s"}): ${base.ops.map(gateLabel).join(" → ")}.`,
      modification
        ? `They are comparing it against the modified version “${modification.label}”.`
        : "They haven't picked a modification yet.",
      ...(comparison ? comparison.differences.slice(0, 4) : []),
      ...(comparison ? [comparison.explanation] : []),
    ],
    prompts: modification
      ? ["Explain what changed", "Why did the distribution change?", "What is interference?"]
      : ["What should I try removing?", "Explain this circuit", "What is superposition?"],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Experiment mode"
        title="What happens if I…?"
        sub="Duplicate a circuit, change one thing, and see exactly how the quantum distribution responds — with an explanation of why."
      />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">Start from a circuit</p>
        <div className="flex flex-wrap gap-2">
          {BASES.map((b) => (
            <button
              key={b.id}
              onClick={() => { setBaseId(b.id); setModId(null); }}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                baseId === b.id ? "border-qx-violet/60 bg-qx-violet/15 text-ink" : "border-line bg-card2/50 text-ink-2 hover:bg-card2/60"
              }`}
            >
              <span className="block font-medium">{b.name}</span>
              <span className="block text-xs text-ink-2">{b.description}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="p-5">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
            <Wand2 className="h-4 w-4 text-accent" /> Choose a modification
          </p>
          <p className="mb-3 text-xs text-ink-2">
            Each option duplicates the circuit and changes exactly one thing, so the effect is unambiguous.
          </p>
          <div className="space-y-1.5">
            {mods.map((m) => (
              <button
                key={m.id}
                onClick={() => { setModId(m.id); recordActivity(); }}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  modId === m.id ? "border-qx-cyan/60 bg-qx-cyan/15 text-ink" : "border-line bg-card2/50 text-ink-2 hover:bg-card2/60"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <Beaker className="h-4 w-4 text-qx-violet" /> Original circuit
              </p>
              <CircuitStatic ops={base.ops} numQubits={base.numQubits} />
              <div className="mt-4">
                <DistributionBars
                  probabilities={comparison ? comparison.originalDistribution.map((d) => d.probability) : analyzeCircuit(originalOps, base.numQubits).idealProbabilities}
                  numQubits={base.numQubits}
                />
              </div>
            </Card>

            <Card className="p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <GitCompare className="h-4 w-4 text-accent" /> Modified circuit
              </p>
              {modifiedOps ? (
                <>
                  <CircuitStatic ops={modifiedOps.map((o) => ({ gate: o.gate, qubits: o.qubits }))} numQubits={base.numQubits} />
                  <div className="mt-4">
                    <DistributionBars probabilities={comparison!.modifiedDistribution.map((d) => d.probability)} numQubits={base.numQubits} />
                  </div>
                </>
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-line text-sm text-ink-3">
                  Pick a modification on the left to run the comparison.
                </div>
              )}
            </Card>
          </div>

          {comparison && (
            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="text-sm font-semibold text-ink">AI explanation</p>
                <GroundedChip label="Computed from both simulations" />
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setModId(null)}>
                  <RefreshCw className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>

              {comparison.differences.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {comparison.differences.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ink-2">
                      <Badge color="slate">Δ</Badge> {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-2">No measurable difference in the distribution.</p>
              )}

              <p className="mt-4 rounded-xl border border-line bg-card2/60 p-4 text-sm leading-relaxed text-ink-2">
                {comparison.explanation}
              </p>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-sm font-semibold text-ink">Where this counts</p>
            <p className="mt-1.5 text-sm text-ink-2">
              Experiment Mode builds intuition and counts toward your streak and XP. Topic <em>mastery</em> is updated by
              quizzes and AI challenges, where the answer can be judged fairly — experiments are deliberately ungraded so
              you can break things on purpose.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LinkButton to="/ai-challenges" size="sm" variant="secondary">Earn mastery in challenges</LinkButton>
              <LinkButton to="/lab" size="sm" variant="ghost">Open the Quantum Lab</LinkButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
