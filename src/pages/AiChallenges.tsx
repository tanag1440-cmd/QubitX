import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, FlaskConical, Lightbulb, RefreshCw, Sparkles, Swords, Target, TrendingUp,
} from "lucide-react";
import { CircuitBuilder } from "../components/lab/CircuitBuilder";
import { Badge, Button, Card, LinkButton, SectionHeading } from "../components/ui";
import { FeedbackBanner, GroundedChip } from "../components/learning";
import { GOAL_TOPIC_WEIGHTS, topicById, topicName } from "../data/learningTopics";
import { validateSpec, DIFFICULTY_ORDER, difficultyIndex, masteryMap } from "../lib/learning/engine";
import { attemptFeedback, generateChallengesForLearner, generateCircuitChallenge } from "../lib/learning/aiService";
import { useStore } from "../lib/store";
import { useRegisterPageContext } from "../lib/tutorContext";
import type { AiChallenge, CircuitOp, Difficulty } from "../types";

export default function AiChallenges() {
  const {
    currentUser, topicMasteryList, mistakePatterns, learningProfile, recordCircuitAttempt, suggestedNext, learningMode,
  } = useStore();

  const goal = learningProfile?.learningGoal ?? null;
  const mastery = useMemo(() => masteryMap(topicMasteryList), [topicMasteryList]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<AiChallenge | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [liveCircuit, setLiveCircuit] = useState<{ ops: CircuitOp[]; numQubits: number }>({ ops: [], numQubits: 2 });

  const handleCircuitChange = useCallback((ops: CircuitOp[], numQubits: number) => {
    setLiveCircuit((cur) =>
      cur.numQubits === numQubits && JSON.stringify(cur.ops) === JSON.stringify(ops) ? cur : { ops, numQubits }
    );
  }, []);

  const challenges = useMemo(() => {
    const ctx = {
      mastery: topicMasteryList.map((m) => ({ topicId: m.topicId, mastery: m.mastery, difficulty: m.difficulty })),
      mistakes: mistakePatterns.map((m) => ({ topicId: m.topicId, mistakeType: m.mistakeType, frequency: m.frequency })),
      goals: goal ? GOAL_TOPIC_WEIGHTS[goal] : [],
    };
    return generateChallengesForLearner(ctx, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicMasteryList, mistakePatterns, goal, round]);

  // Publish the challenge *and* the learner's live attempt, including whether it
  // currently satisfies the goal — so "give me a hint" is about their real circuit.
  const liveValidation = selected && liveCircuit.ops.length > 0
    ? validateSpec(liveCircuit.ops, liveCircuit.numQubits, selected.spec)
    : null;

  // Page-specific facts only: the AI service derives the circuit's numbers itself
  // from the circuit we publish, so repeating them here would double them up.
  const liveCircuitFacts = [
    liveCircuit.ops.length === 0
      ? "Their challenge circuit builder is currently empty."
      : "Reading their in-progress circuit straight from the challenge builder.",
  ];

  useRegisterPageContext({
    kind: "challenge",
    title: selected ? selected.title : "AI Challenges",
    subtitle: selected ? `${selected.difficulty} · ${topicName(selected.topicId)}` : undefined,
    topicId: selected?.topicId ?? null,
    circuit: liveCircuit,
    // Ordered most decision-relevant first — the copilot cites these directly.
    facts: selected
      ? [
          `The learner is working on the challenge “${selected.title}”.`,
          `Goal: ${selected.requirement}`,
          ...(liveValidation
            ? [liveValidation.pass
                ? "Their current circuit ALREADY satisfies the goal."
                : `Their current circuit does not yet satisfy the goal: ${liveValidation.message}`]
            : []),
          `Difficulty ${selected.difficulty}; hints already revealed: ${revealed}.`,
          ...(() => {
            const st = mastery.get(selected.topicId);
            return st ? [`Their ${topicName(selected.topicId)} mastery is ${st.mastery}% with ${st.attempts} attempt${st.attempts === 1 ? "" : "s"}.`] : [];
          })(),
          ...(result ? [`Last run result: ${result.success ? "passed" : "failed"} — ${result.message}`] : []),
          ...liveCircuitFacts,
        ]
      : ["The learner is browsing their generated challenge list."],
    prompts: !selected
      ? ["What should I practice?", "How are these challenges chosen?"]
      : result && !result.success
        ? ["Why did my circuit fail?", "Give me a hint", "Explain the concept behind this challenge"]
        : result && result.success
          ? ["Why did that work?", "What should I practice next?"]
          : liveCircuit.ops.length > 0
            ? ["Is my circuit on track?", "Give me a hint", "Explain my circuit"]
            : ["Explain what this challenge asks", "Give me a hint", "Which gate should I start with?"],
  });

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Swords className="mx-auto mb-4 h-12 w-12 text-qx-violet" />
        <h1 className="text-2xl font-bold text-white">AI Challenges</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Challenges generated from your weakest topics, validated by simulating your circuit's behaviour —
          not by matching a fixed answer. Log in to get yours.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton to="/login">Log in</LinkButton>
          <LinkButton to="/signup" variant="secondary">Create account</LinkButton>
        </div>
      </div>
    );
  }

  const pick = (ch: AiChallenge) => {
    setSelected(ch);
    setRevealed(0);
    setResult(null);
    setStartedAt(Date.now());
  };

  // Live behavioral evaluation shown inside the builder.
  const evaluator = (ops: CircuitOp[], numQubits: number) => {
    if (!selected) return null;
    if (ops.filter((o) => o.gate !== "M").length === 0) return null;
    const v = validateSpec(ops, numQubits, selected.spec);
    return { pass: v.pass, message: v.message };
  };

  const onRun = (ops: CircuitOp[], numQubits: number) => {
    if (!selected) return;
    const res = recordCircuitAttempt({
      topicId: selected.topicId,
      ops,
      numQubits,
      challengeId: selected.id,
      spec: selected.spec,
      timeTaken: Math.round((Date.now() - startedAt) / 1000),
      hintsUsed: revealed,
    });
    if (res) setResult(res);
  };

  const harder = () => {
    if (!selected) return;
    const nextIndex = Math.min(DIFFICULTY_ORDER.length - 1, difficultyIndex(selected.difficulty) + 1);
    const harderChallenge = generateCircuitChallenge(selected.topicId, DIFFICULTY_ORDER[nextIndex]);
    if (harderChallenge) pick(harderChallenge);
  };

  const easier = () => {
    if (!selected) return;
    const nextIndex = Math.max(0, difficultyIndex(selected.difficulty) - 1);
    const easierChallenge = generateCircuitChallenge(selected.topicId, DIFFICULTY_ORDER[nextIndex]);
    if (easierChallenge) pick(easierChallenge);
  };

  const feedback = selected && result
    ? attemptFeedback({
        success: result.success,
        kind: "circuit",
        topicName: topicName(selected.topicId),
        difficulty: selected.difficulty,
        reason: result.message,
      })
    : null;

  const topicState = selected ? mastery.get(selected.topicId) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Adaptive practice"
        title="AI Challenges"
        sub="Generated from what you're weakest at, then validated by simulation — any circuit that produces the right behaviour is accepted."
      />

      {!selected ? (
        <div className="space-y-4">
          {challenges.length === 0 && (
            <Card className="p-6 text-sm text-slate-400">
              Take the diagnostic first so I can target your weak topics.
              <LinkButton to="/diagnostic" size="sm" className="ml-3">Run diagnostic</LinkButton>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {challenges.map((ch) => {
              const t = topicById(ch.topicId);
              return (
                <Card key={ch.id} className="flex flex-col p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge color="violet">{t?.name ?? ch.topicId}</Badge>
                    <Badge color={difficultyIndex(ch.difficulty) >= 3 ? "rose" : difficultyIndex(ch.difficulty) >= 2 ? "amber" : "cyan"}>
                      {ch.difficulty}
                    </Badge>
                  </div>
                  <p className="font-semibold text-white">{ch.title}</p>
                  <p className="mt-1.5 flex-1 text-sm text-slate-400">{ch.prompt}</p>
                  <p className="mt-3 text-xs text-slate-500">{ch.numQubits} qubit{ch.numQubits > 1 ? "s" : ""} · validated by behaviour</p>
                  <Button size="sm" className="mt-4" onClick={() => pick(ch)}>
                    Start challenge <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              );
            })}
          </div>

          <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-400">Want a fresh set targeted at your current weak spots?</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setRound((r) => r + 1)}>Regenerate challenges</Button>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge color="violet">{topicName(selected.topicId)}</Badge>
                    <Badge color="slate">{selected.difficulty}</Badge>
                    <GroundedChip label="Generated from your profile" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{selected.title}</h2>
                  <p className="mt-1 text-sm text-slate-300">{selected.prompt}</p>
                  <p className="mt-2 text-sm text-slate-400"><span className="font-semibold text-slate-300">Success criteria: </span>{selected.requirement}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Back</Button>
              </div>
            </Card>

            <CircuitBuilder
              key={selected.id}
              initialQubits={selected.numQubits}
              maxQubits={Math.max(3, selected.numQubits)}
              evaluator={evaluator}
              evaluatorLabel="Behavioral check"
              onRun={onRun}
              onCircuitChange={handleCircuitChange}
              showAiTools
              aiTopicId={selected.topicId}
              aiSpec={selected.spec}
            />

            {feedback && (
              <FeedbackBanner
                correct={feedback.correct}
                headline={feedback.headline}
                detail={feedback.detail}
                hint={feedback.hint}
              />
            )}

            {result && result.success && (
              <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-qx-mint" />
                  <div>
                    <p className="text-sm font-semibold text-white">{selected.explanation}</p>
                    <p className="text-xs text-slate-400">Mastery for {topicName(selected.topicId)} updated automatically.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {feedback?.offerHarder && <Button size="sm" onClick={harder}><TrendingUp className="h-4 w-4" /> Try a harder one</Button>}
                  <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>Next challenge</Button>
                </div>
              </Card>
            )}

            {result && !result.success && (
              <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                <p className="text-sm text-slate-300">Want to step back to an easier variant, then return to this one?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={easier}>Easier variant</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setResult(null); setStartedAt(Date.now()); }}>Retry this one</Button>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Lightbulb className="h-4 w-4 text-qx-amber" /> Hints ({revealed}/{selected.hints.length})
              </p>
              <div className="mt-3 space-y-2">
                {selected.hints.slice(0, revealed).map((h, i) => (
                  <p key={i} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">{h}</p>
                ))}
                {revealed === 0 && <p className="text-xs text-slate-500">No hints used yet. Hints don't block the challenge — they just change how much you earned from it.</p>}
              </div>
              {revealed < selected.hints.length && (
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => setRevealed((r) => r + 1)}>
                  Reveal hint {revealed + 1}
                </Button>
              )}
            </Card>

            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Target className="h-4 w-4 text-qx-cyan" /> Adaptive difficulty
              </p>
              <p className="mt-1 text-xs text-slate-400">Adjusted gradually from your recent results — one step at a time.</p>
              {topicState ? (
                <>
                  <p className="mt-3 text-sm text-slate-300">
                    {topicName(selected.topicId)}: <span className="font-semibold text-white">{topicState.mastery}%</span> mastery,
                    working difficulty <span className="font-semibold text-white">{topicState.difficulty}</span>.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {topicState.recentScores.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-14 text-xs text-slate-500">try {i + 1}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-gradient-to-r from-qx-violet to-qx-cyan" style={{ width: `${s * 100}%` }} />
                        </div>
                        <span className="w-10 text-right font-mono text-xs text-slate-400">{Math.round(s * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Starting difficulty: {selected.difficulty}. Two strong results will move you up a level.</p>
              )}
            </Card>

            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <FlaskConical className="h-4 w-4 text-qx-mint" /> How validation works
              </p>
              <p className="mt-2 text-sm text-slate-400">
                We simulate your circuit and compare the resulting distribution and entanglement against the required
                behaviour. A different circuit that does the same thing passes — because understanding is the goal, not gate order.
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-semibold text-white">Mode: <span className="text-qx-cyan capitalize">{learningMode}</span></p>
              <p className="mt-1 text-xs text-slate-400">
                Switch modes on your learning path — Challenge mode hides hints, Exam mode removes them entirely.
              </p>
              <LinkButton to="/learning-path" size="sm" variant="ghost" className="mt-2">Change mode</LinkButton>
            </Card>
          </div>
        </div>
      )}

      {suggestedNext[0] && !selected && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-qx-cyan" />
            <div>
              <p className="text-sm font-semibold text-white">{suggestedNext[0].title}</p>
              <p className="mt-1 text-sm text-slate-400">{suggestedNext[0].reason}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setRound((r) => r + 1)}>Adapt challenges to this</Button>
        </Card>
      )}
    </div>
  );
}
