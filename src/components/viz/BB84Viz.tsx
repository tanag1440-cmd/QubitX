import React, { useState } from "react";
import { Ket } from "../quantum/display";
import { Button, Card } from "../ui";

interface Round {
  index: number;
  aliceBit: 0 | 1;
  aliceBasis: "Z" | "X";
  bobBasis: "Z" | "X";
  match: boolean;
  bobBit: 0 | 1;
  sifted: boolean;
}

const N = 8;
const randBit = (): 0 | 1 => (Math.random() < 0.5 ? 0 : 1);

function runProtocol(withEve: boolean): { rounds: Round[]; key: string; errors: number; checked: number } {
  const rounds: Round[] = [];
  let key = "";
  const eveBasis = () => (Math.random() < 0.5 ? "Z" : "X") as "Z" | "X";

  for (let i = 0; i < N; i++) {
    const aliceBit = randBit();
    const aliceBasis = eveBasis();
    const bobBasis = eveBasis();
    let bobBit: 0 | 1;

    // Physics: Bob only recovers Alice's bit when bases match — unless Eve
    // disturbed the qubit, which corrupts ~half of the otherwise-good rounds.
    let disturbed = false;
    if (withEve && Math.random() < 0.5) {
      disturbed = true;
      // Eve measured in a (possibly wrong) basis and resent a fresh qubit
      bobBit = eveBasis() === aliceBasis ? aliceBit : randBit();
    } else {
      bobBit = bobBasis === aliceBasis ? aliceBit : randBit();
    }

    const match = aliceBasis === bobBasis;
    const sifted = match && !disturbed;
    if (sifted) key += String(aliceBit);
    rounds.push({ index: i, aliceBit, aliceBasis, bobBasis, match, bobBit, sifted });
  }

  // Error check on the sifted key (we "sacrifice" up to 3 bits to test).
  const checkedBits = key.slice(0, 3);
  const siftedRounds = rounds.filter((r) => r.sifted);
  let errors = 0;
  siftedRounds.slice(0, 3).forEach((r) => {
    if (r.bobBit !== r.aliceBit) errors++;
  });

  return { rounds, key: key.slice(3), errors, checked: checkedBits.length };
}

/** Lesson 9 demo: simulate BB84 with an optional eavesdropper. */
export function BB84Viz() {
  const [withEve, setWithEve] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runProtocol> | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setResult(runProtocol(withEve));
      setRunning(false);
    }, 350);
  };

  const detected = result !== null && result.checked > 0 && result.errors > 0;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-ink">BB84 key exchange</h4>
          <p className="mt-1 text-sm text-ink-2">
            Alice sends {N} random qubits; bases are compared publicly; matching positions form the key.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={withEve} onChange={(e) => setWithEve(e.target.checked)} className="h-4 w-4 accent-rose-500" />
            Eavesdropper (Eve)
          </label>
          <Button onClick={run} disabled={running} size="sm">
            {running ? "Transmitting…" : "Run protocol"}
          </Button>
        </div>
      </div>

      {result === null ? (
        <p className="mt-5 rounded-xl border border-dashed border-line py-8 text-center text-sm text-ink-3">
          {running ? "Transmitting photons…" : "Run the protocol to see the key exchange step by step."}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-3">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Alice bit</th>
                  <th className="py-2 pr-3">Alice basis</th>
                  <th className="py-2 pr-3">Bob basis</th>
                  <th className="py-2 pr-3">Bob result</th>
                  <th className="py-2 pr-3">Bases match?</th>
                  <th className="py-2">Key bit</th>
                </tr>
              </thead>
              <tbody>
                {result.rounds.map((r) => (
                  <tr key={r.index} className="border-b border-line">
                    <td className="py-2 pr-3 font-mono text-ink-3">{r.index + 1}</td>
                    <td className="py-2 pr-3 font-mono text-qx-violet"><Ket value={r.aliceBit} /></td>
                    <td className="py-2 pr-3 font-mono">{r.aliceBasis}</td>
                    <td className="py-2 pr-3 font-mono">{r.bobBasis}</td>
                    <td className="py-2 pr-3 font-mono text-qx-cyan"><Ket value={r.bobBit} /></td>
                    <td className="py-2 pr-3">{r.match ? <span className="text-qx-mint">✓</span> : <span className="text-ink-3">✗</span>}</td>
                    <td className="py-2 font-mono">
                      {r.sifted ? <span className="font-bold text-qx-mint"><Ket value={r.aliceBit} /></span> : <span className="text-ink-3">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-line bg-card2/60 p-4">
              <p className="text-xs uppercase tracking-wider text-ink-3">Shared key</p>
              <p className="mt-1 font-mono text-lg font-bold text-qx-mint">
                {result.key === "" ? "—" : result.key.split("").join(" ")}
              </p>
              <p className="mt-1 text-xs text-ink-3">{result.key.length} bits (after sacrificing check bits)</p>
            </div>
            <div className="rounded-xl border border-line bg-card2/60 p-4">
              <p className="text-xs uppercase tracking-wider text-ink-3">Error check</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink">
                {result.errors}/{result.checked} mismatches
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${detected ? "border-rose-500/40 bg-rose-500/10" : "border-qx-mint/40 bg-qx-mint/10"}`}>
              <p className="text-xs uppercase tracking-wider text-ink-3">Verdict</p>
              <p className={`mt-1 text-sm font-bold ${detected ? "text-rose-400" : "text-qx-mint"}`}>
                {detected ? "⚠ EAVESDROPPER DETECTED" : "✓ Secure — no disturbance"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-3">
            Turn Eve on and rerun a few times: her interference shows up as mismatches in the sacrificed check bits.
            Any detectable disturbance means the key is aborted — that's what makes QKD provably secure.
          </p>
        </>
      )}
    </Card>
  );
}