import React, { useEffect, useMemo, useState } from "react";
import { Bug, Code2, FlaskConical, Sparkles, Wand2 } from "lucide-react";
import { Badge, Button, Card } from "../ui";
import { ComingSoon, DistributionBars, GroundedChip, IssueCard } from "../learning";
import { analyzeCircuit } from "../../lib/learning/engine";
import {
  debugReport, explainCircuitStructured, frameworkSnippets, sampleNoisyCounts,
  type CircuitExplanation, type DebugReport, type FrameworkSnippets,
} from "../../lib/learning/aiService";
import type { ChallengeSpec, CircuitOp, TopicId } from "../../types";
import { useI18n } from "../../lib/i18n";

const SHOTS = 1000;

type Tab = "none" | "explain" | "debug" | "frameworks" | "noise";

export function CircuitAiPanel({
  ops, qubits, topicId, spec,
}: {
  ops: CircuitOp[]; qubits: number; topicId?: TopicId; spec?: ChallengeSpec;
}) {
  const { language, t } = useI18n();
  const [tab, setTab] = useState<Tab>("none");
  const [explanation, setExplanation] = useState<CircuitExplanation | null>(null);
  const [debug, setDebug] = useState<DebugReport | null>(null);
  const [frameworks, setFrameworks] = useState<FrameworkSnippets | null>(null);
  const [fwTab, setFwTab] = useState<"qiskit" | "cirq" | "pennylane">("qiskit");
  const [noiseRate, setNoiseRate] = useState(0.05);
  const [noise, setNoise] = useState<{ ideal: number[]; noisy: number[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const analysis = useMemo(() => analyzeCircuit(ops, qubits), [ops, qubits]);
  const hasCircuit = ops.filter((o) => o.gate !== "M").length > 0;

  // Any change to the circuit invalidates previously shown analysis — we must
  // never display results that belong to a circuit the learner has since edited.
  useEffect(() => {
    setTab("none");
    setExplanation(null);
    setDebug(null);
    setFrameworks(null);
    setNoise(null);
  }, [ops, qubits]);

  const doExplain = () => {
    setBusy(true);
    setTimeout(() => {
      setExplanation(explainCircuitStructured(ops, qubits, language));
      setDebug(null);
      setFrameworks(null);
      setNoise(null);
      setTab("explain");
      setBusy(false);
    }, 220);
  };

  const doDebug = () => {
    setBusy(true);
    setTimeout(() => {
      setDebug(debugReport(ops, qubits, spec, language));
      setExplanation(null);
      setFrameworks(null);
      setNoise(null);
      setTab("debug");
      setBusy(false);
    }, 220);
  };

  const doFrameworks = () => {
    setFrameworks(frameworkSnippets(ops, qubits));
    setExplanation(null);
    setDebug(null);
    setNoise(null);
    setTab("frameworks");
  };

  const doNoise = () => {
    if (!hasCircuit) return;
    setBusy(true);
    setTimeout(() => {
      const idealProbs = analysis.idealProbabilities;
      const ideal = new Array(idealProbs.length).fill(0);
      for (let i = 0; i < SHOTS; i++) {
        let r = Math.random();
        let acc = 0;
        for (let k = 0; k < idealProbs.length; k++) {
          acc += idealProbs[k];
          if (r < acc) { ideal[k]++; break; }
        }
      }
      const noisy = sampleNoisyCounts(ops, qubits, { errorRate: noiseRate, shots: SHOTS });
      setNoise({ ideal, noisy });
      setExplanation(null);
      setDebug(null);
      setFrameworks(null);
      setTab("noise");
      setBusy(false);
    }, 320);
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Sparkles className="h-4 w-4 text-accent" /> AI circuit tools
        </h3>
        <GroundedChip label="Reads your actual circuit" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={doExplain} disabled={!hasCircuit || busy}>
          <Wand2 className="h-4 w-4" /> {t("explainCircuit")}
        </Button>
        <Button size="sm" variant="secondary" onClick={doDebug} disabled={!hasCircuit || busy}>
          <Bug className="h-4 w-4" /> {t("debugCircuit")}
        </Button>
        <Button size="sm" variant="secondary" onClick={doFrameworks} disabled={!hasCircuit}>
          <Code2 className="h-4 w-4" /> {t("compareFrameworks")}
        </Button>
        <Button size="sm" variant="secondary" onClick={doNoise} disabled={!hasCircuit || busy}>
          <FlaskConical className="h-4 w-4" /> {t("idealVsNoisy")}
        </Button>
      </div>

      {!hasCircuit && (
        <p className="mt-3 text-xs text-ink-3">
          Add at least one gate and these tools will analyse the real circuit — using the same simulator results you see above.
        </p>
      )}

      {tab === "explain" && explanation && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-card2/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-ink-3">{t("initialState")}</p>
              <p className="mt-1 font-mono text-sm text-ink">{explanation.initialState}</p>
            </div>
            <div className="rounded-xl border border-line bg-card2/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-ink-3">{t("finalState")}</p>
              <p className="mt-1 truncate font-mono text-sm text-ink" title={explanation.finalState}>{explanation.finalState}</p>
            </div>
            <div className="rounded-xl border border-line bg-card2/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-ink-3">{t("entanglement")}</p>
              <p className="mt-1 text-sm text-ink">{explanation.entangled ? t("entangled") : t("notEntangled")}</p>
            </div>
          </div>

          <ol className="space-y-2">
            {explanation.steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-line bg-card2/50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-qx-violet/20 text-xs font-bold text-qx-violet">{i + 1}</span>
                <span className="text-sm text-ink-2">
                  <span className="font-mono font-semibold text-ink">{s.gate}</span> {s.effect}.
                </span>
              </li>
            ))}
          </ol>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Expected measurement outcomes</p>
            <DistributionBars probabilities={explanation.distribution.map((d) => d.probability)} numQubits={qubits} />
          </div>

          <p className="rounded-xl border border-line bg-card2/60 p-4 text-sm leading-relaxed text-ink-2">{explanation.text}</p>
        </div>
      )}

      {tab === "debug" && debug && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-ink-2">{debug.summary}</p>
          {debug.issues.length === 0 ? (
            <div className="rounded-xl border border-qx-mint/30 bg-qx-mint/10 p-4 text-sm text-qx-mint">
              {t("noProblems")} {analysis.entangled ? t("debugNoEntangled") : t("debugNoSimple")}
            </div>
          ) : (
            debug.issues.map((issue, i) => (
              <IssueCard key={i} severity={issue.severity} title={issue.title}>
                <p><span className="font-semibold text-ink">{t("why")} </span>{issue.why}</p>
                <p><span className="font-semibold text-ink">{t("hint")} </span>{issue.hint}</p>
              </IssueCard>
            ))
          )}
          <p className="text-xs text-ink-3">
            Debugging checks the circuit you actually built. It never invents gates or results — and it won't hand you the full
            solution unless you ask for it.
          </p>
        </div>
      )}

      {tab === "frameworks" && frameworks && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            {(["qiskit", "cirq", "pennylane"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFwTab(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  fwTab === f ? "border-qx-violet/60 bg-qx-violet/15 text-ink" : "border-line bg-card2 text-ink-2 hover:bg-card2"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <pre className="overflow-x-auto rounded-xl border border-line bg-card2/80 p-4 text-xs leading-relaxed text-ink-2">
            <code>{frameworks[fwTab]}</code>
          </pre>
          <p className="rounded-xl border border-line bg-card2/60 p-3 text-xs leading-relaxed text-ink-2">{frameworks.note}</p>
          <ComingSoon>
            Live execution on Qiskit Aer, Cirq and PennyLane backends. This prototype runs your circuit on the built-in
            state-vector simulator; the framework adapters are the next step.
          </ComingSoon>
        </div>
      )}

      {tab === "noise" && noise && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Depolarizing error rate: {(noiseRate * 100).toFixed(0)}%
            </label>
            <input
              type="range" min={0} max={0.3} step={0.01} value={noiseRate}
              onChange={(e) => setNoiseRate(Number(e.target.value))}
              className="h-1.5 w-40 accent-qx-violet"
            />
            <Button size="sm" variant="secondary" onClick={doNoise}>Re-run</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
                Ideal simulation <Badge color="cyan">{SHOTS} shots</Badge>
              </p>
              <DistributionBars probabilities={noise.ideal.map((n) => n / SHOTS)} numQubits={qubits} />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
                Noisy simulation <Badge color="rose">educational model</Badge>
              </p>
              <DistributionBars probabilities={noise.noisy.map((n) => n / SHOTS)} numQubits={qubits} />
            </div>
          </div>

          <p className="rounded-xl border border-line bg-card2/60 p-4 text-sm leading-relaxed text-ink-2">
            The ideal simulation reproduces the exact quantum distribution. The noisy run uses a simplified
            <span className="font-semibold text-ink"> depolarizing noise model</span>: after each gate a random Pauli error is
            applied with probability p, and measurement outcomes can flip. That's why probability mass leaks into outcomes the
            ideal circuit forbids. It illustrates the <em>kind</em> of deviation real hardware shows — it is not a calibration
            profile of any specific device.
          </p>
        </div>
      )}
    </Card>
  );
}
