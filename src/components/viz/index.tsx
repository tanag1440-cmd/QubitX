import React from "react";
import { BB84Viz } from "./BB84Viz";
import { BitVsQubit } from "./BitVsQubit";
import { CircuitMini } from "./CircuitMini";
import { EntanglementViz } from "./EntanglementViz";
import { GatePlayground } from "./GatePlayground";
import { InterferenceViz } from "./InterferenceViz";
import { MeasurementViz } from "./MeasurementViz";
import { QubitVisual } from "./QubitVisual";
import { SuperpositionViz } from "./SuperpositionViz";

export const DEMOS: Record<string, React.ComponentType> = {
  "bit-vs-qubit": BitVsQubit,
  "qubit-visual": QubitVisual,
  "superposition-demo": SuperpositionViz,
  "measurement-demo": MeasurementViz,
  "gate-playground": GatePlayground,
  "circuit-mini": CircuitMini,
  "entanglement-demo": EntanglementViz,
  "interference-demo": InterferenceViz,
  "bb84-demo": BB84Viz,
};

export function LessonDemo({ id }: { id: string }) {
  const Demo = DEMOS[id];
  if (!Demo) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 py-10 text-center text-sm text-slate-500">
        This interactive demo is coming soon.
      </div>
    );
  }
  return <Demo />;
}