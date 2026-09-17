import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Award, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Lightbulb, Lock, PartyPopper, Sparkles, Zap,
} from "lucide-react";
import { LessonDemo } from "../components/viz";
import { Ket } from "../components/quantum/display";
import { Badge, Button, Card, ProgressBar } from "../components/ui";
import { LESSONS, MODULES, lessonById, moduleById } from "../data/content";
import { useStore, type QuizOutcome } from "../lib/store";
import { matchTopic } from "../lib/learning/aiService";
import { useRegisterPageContext } from "../lib/tutorContext";
import type { QuizQuestion } from "../types";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = lessonId ? lessonById(lessonId) : undefined;
  const module = lesson ? moduleById(lesson.moduleId) : undefined;

  const { completedLessonIds, db, currentUser, completeLesson, submitQuiz, setLessonProgress } = useStore();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  useEffect(() => {
    if (lesson && !completedLessonIds.includes(lesson.id)) {
      setLessonProgress(lesson.id, 15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // ── Publish this lesson (and the exact quiz question in front of the learner)
  // so the copilot can help with the doubt they actually have, in place.
  const activeQuestion = lesson ? lesson.quiz[quizIndex] : undefined;
  const answered = revealed && selected !== null && activeQuestion;
  const answerNote = !answered
    ? undefined
    : selected === activeQuestion!.correctIndex
      ? `The learner just answered “${activeQuestion!.options[selected!]}” — that is CORRECT. ${activeQuestion!.explanation}`
      : `The learner just answered “${activeQuestion!.options[selected!]}” — that is WRONG. The correct answer is “${activeQuestion!.options[activeQuestion!.correctIndex]}”. ${activeQuestion!.explanation}`;

  // The topic of the question on screen, so "why was my answer wrong?" is
  // answered about the right concept rather than generically.
  const questionTopic = activeQuestion
    ? matchTopic(`${activeQuestion.question} ${activeQuestion.options.join(" ")} ${activeQuestion.explanation}`)
    : null;

  useRegisterPageContext({
    kind: "lesson",
    title: lesson ? lesson.title : "Lesson",
    subtitle: module?.title,
    topicId: questionTopic,
    circuit: null,
    focus:
      quizStarted && activeQuestion && !outcome
        ? { question: activeQuestion.question, note: answerNote }
        : undefined,
    facts: lesson
      ? [
          `Reader is on the lesson “${lesson.title}” (module ${module?.order}: ${module?.title}).`,
          completedLessonIds.includes(lesson.id)
            ? "They have already completed this lesson."
            : "This lesson is still in progress.",
          `Key takeaway: ${lesson.keyTakeaway}`,
          ...(answerNote ? [answerNote] : []),
        ]
      : [],
    prompts: !lesson
      ? []
      : quizStarted && activeQuestion && !outcome
        ? (revealed
            ? [
                selected === activeQuestion.correctIndex ? "Why is that the right answer?" : "Why was my answer wrong?",
                "Explain the correct answer simply",
              ]
            : ["Give me a hint for this question", "What concept does this question test?", "Explain this concept simply"])
        : ["Explain this lesson simply", `Give me an analogy for ${lesson.title}`, "Quiz me on this"],
  });

  if (!lesson || !module) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Lesson not found</h1>
        <p className="mt-2 text-slate-400">This lesson doesn't exist (or was removed).</p>
        <Button className="mt-6" onClick={() => navigate("/learn")}><ArrowLeft className="h-4 w-4" /> Back to Learn</Button>
      </div>
    );
  }

  const completed = completedLessonIds.includes(lesson.id);
  const progress = currentUser
    ? db.lessonProgress.find((p) => p.userId === currentUser.id && p.lessonId === lesson.id)?.progress ?? 0
    : 0;

  const quiz = lesson.quiz;
  const question = quiz[quizIndex];

  const pick = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setAnswers((a) => {
      const next = [...a];
      next[quizIndex] = idx;
      return next;
    });
  };

  const nextQuestion = () => {
    if (quizIndex + 1 < quiz.length) {
      setQuizIndex(quizIndex + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const res = submitQuiz(lesson.id, answers);
      setOutcome(res);
      if (res.score > 0) completeLesson(lesson.id);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setQuizIndex(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
    setOutcome(null);
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const restartQuiz = () => {
    setOutcome(null);
    setQuizStarted(true);
    setQuizIndex(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
  };

  const markComplete = () => {
    completeLesson(lesson.id);
    setLessonProgress(lesson.id, 100);
  };

  const prevLesson = LESSONS.find((l) => l.moduleId === MODULES[Math.max(0, module.order - 2)]?.id);
  const nextLesson = LESSONS.find((l) => l.moduleId === MODULES[module.order]?.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* breadcrumb + progress */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/learn" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-32"><ProgressBar value={completed ? 100 : progress} /></div>
          <span className="font-mono text-xs text-slate-400">{completed ? "100%" : `${progress}%`}</span>
          {!completed && (
            <Button variant="success" size="sm" onClick={markComplete}>
              <CheckCircle2 className="h-4 w-4" /> Mark complete
            </Button>
          )}
        </div>
      </div>

      {/* header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="violet">Module {module.order} · {module.title}</Badge>
          <span className="flex items-center gap-1 font-mono text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
          <span className="flex items-center gap-1 font-mono text-xs text-qx-amber"><Zap className="h-3.5 w-3.5" /> {lesson.xp} XP on completion</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{lesson.title}</h1>
        <p className="mt-2 text-lg text-slate-400">{lesson.summary}</p>
      </div>

      {/* sections */}
      <div className="space-y-10">
        {lesson.sections.map((s, i) => {
          switch (s.kind) {
            case "text":
              return (
                <section key={i} className="prose-invert">
                  {s.heading && <h2 className="mb-3 text-xl font-bold text-white">{s.heading}</h2>}
                  {s.body && <p className="leading-relaxed text-slate-300">{s.body}</p>}
                </section>
              );
            case "demo":
              return (
                <section key={i}>
                  {s.heading && <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white"><Sparkles className="h-5 w-5 text-qx-cyan" /> {s.heading}</h2>}
                  <LessonDemo id={s.demo ?? ""} />
                </section>
              );
            case "example":
              return s.example ? (
                <section key={i} className="rounded-2xl border border-qx-amber/25 bg-qx-amber/5 p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-qx-amber">
                    <Lightbulb className="h-4.5 w-4.5" /> {s.example.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-300">{s.example.body}</p>
                  {s.example.code && (
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-950/80 p-4 font-mono text-sm text-qx-cyan">{s.example.code}</pre>
                  )}
                </section>
              ) : null;
            case "takeaway":
              return (
                <section key={i} className="rounded-2xl border border-qx-mint/30 bg-qx-mint/10 p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-qx-mint">
                    <CheckCircle2 className="h-5 w-5" /> {s.heading ?? "Key takeaway"}
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-200">{s.body}</p>
                </section>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* quiz */}
      <div ref={quizRef} className="mt-12 scroll-mt-24">
        {!quizStarted ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-qx-violet/15">
              <Award className="h-7 w-7 text-qx-violet" />
            </div>
            <h2 className="text-2xl font-bold text-white">Quick quiz</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              {quiz.length} questions with instant feedback. Score 100% for the Quiz Ace achievement. XP earned: up to 40.
            </p>
            <Button className="mt-6" size="lg" onClick={startQuiz}>
              Start quiz <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ) : outcome ? (
          <Card className="p-8 text-center">
            <PartyPopper className="mx-auto mb-4 h-10 w-10 text-qx-amber" />
            <h2 className="text-2xl font-bold text-white">
              {outcome.perfect ? "Perfect score! 🎉" : outcome.score >= quiz.length / 2 ? "Nice work!" : "Good try!"}
            </h2>
            <p className="mt-2 font-mono text-3xl font-extrabold text-qx-cyan">
              {outcome.score} / {outcome.total}
            </p>
            <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-4">
              <div className="rounded-xl border border-qx-mint/30 bg-qx-mint/10 px-4 py-2 text-sm text-qx-mint">
                +{outcome.xpEarned} XP
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {outcome.perfect ? "Quiz Ace unlocked!" : "Keep practicing"}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={restartQuiz}>Retake quiz</Button>
              {!completed && <Button onClick={markComplete}><CheckCircle2 className="h-4 w-4" /> Complete lesson</Button>}
            </div>
            <p className="mt-5 text-xs text-slate-500">
              {lesson.keyTakeaway}
            </p>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-white">Quick quiz</h2>
              <span className="font-mono text-sm text-slate-500">Question {quizIndex + 1} / {quiz.length}</span>
            </div>
            <div className="mb-6 flex gap-1.5">
              {quiz.map((q, i) => (
                <div
                  key={q.id}
                  className={`h-1.5 flex-1 rounded-full ${i < quizIndex ? "bg-qx-violet" : i === quizIndex ? "bg-qx-violet/60 animate-pulse-soft" : "bg-white/10"}`}
                />
              ))}
            </div>

            <QuestionCard question={question} revealed={revealed} selected={selected} onPick={pick} />

            {revealed && (
              <div className="mt-6 flex items-center justify-between">
                <p className="max-w-md text-sm">
                  {selected === question.correctIndex ? (
                    <span className="text-qx-mint">✓ Correct. {question.explanation}</span>
                  ) : (
                    <span className="text-rose-400">
                      ✗ {selected !== null ? "Not quite." : "No answer selected."} {question.explanation}
                    </span>
                  )}
                </p>
                <Button onClick={nextQuestion}>
                  {quizIndex + 1 < quiz.length ? <>Next <ChevronRight className="h-4 w-4" /></> : <>See results <Award className="h-4 w-4" /></>}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* prev / next lesson */}
      <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
        {prevLesson && !completedLessonIds.includes(prevLesson.id) ? (
          <Link to={`/learn/${prevLesson.id}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" /> <span><span className="block text-xs text-slate-600">Previous</span>{prevLesson.title}</span>
          </Link>
        ) : <span />}
        {nextLesson && (
          <Link to={`/learn/${nextLesson.id}`} className="flex items-center gap-2 text-right text-sm text-qx-cyan hover:underline">
            <span><span className="block text-xs text-slate-600">Next module</span>{nextLesson.title}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="hidden"><Lock className="h-4 w-4" /></div>
    </div>
  );
}

function QuestionCard({ question, revealed, selected, onPick }: {
  question: QuizQuestion; revealed: boolean; selected: number | null; onPick: (i: number) => void;
}) {
  const label = ["A", "B", "C", "D"];
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">{question.question}</h3>
      <div className="mt-4 grid gap-2.5">
        {question.options.map((opt, i) => {
          const isCorrect = revealed && i === question.correctIndex;
          const isWrongPick = revealed && selected === i && i !== question.correctIndex;
          return (
            <button
              key={i}
              onClick={() => onPick(i)}
              disabled={revealed}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                isCorrect
                  ? "border-qx-mint/60 bg-qx-mint/15"
                  : isWrongPick
                    ? "border-rose-500/60 bg-rose-500/10"
                    : selected === i
                      ? "border-qx-violet/60 bg-qx-violet/15"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                isCorrect ? "bg-qx-mint/30 text-qx-mint" : isWrongPick ? "bg-rose-500/30 text-rose-300" : "bg-white/10 text-slate-400"
              }`}>
                {isCorrect ? "✓" : isWrongPick ? "✗" : label[i]}
              </span>
              <span className="text-sm text-slate-200">{opt}</span>
            </button>
          );
        })}
      </div>
      {question.category === "circuit" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Ket value={0} /> Circuit question — try it in the <Link to="/lab" className="text-qx-cyan hover:underline">Quantum Lab</Link>.
        </p>
      )}
    </div>
  );
}