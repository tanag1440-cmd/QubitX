import React from "react";
import {
  BadgeCheck, Binary, CircleDot, Compass, Flame, FlaskConical,
  Link2, Lock, MessageCircleQuestion, Sprout, Swords, Trophy, Waves,
} from "lucide-react";
import { Badge, Card, SectionHeading } from "../components/ui";
import { ACHIEVEMENTS } from "../data/content";
import { useStore } from "../lib/store";

const ICONS: Record<string, React.ReactNode> = {
  CircleDot: <CircleDot className="h-5 w-5" />,
  Binary: <Binary className="h-5 w-5" />,
  Waves: <Waves className="h-5 w-5" />,
  Link2: <Link2 className="h-5 w-5" />,
  Sprout: <Sprout className="h-5 w-5" />,
  Compass: <Compass className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  BadgeCheck: <BadgeCheck className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Swords: <Swords className="h-5 w-5" />,
  MessageCircleQuestion: <MessageCircleQuestion className="h-5 w-5" />,
  FlaskConical: <FlaskConical className="h-5 w-5" />,
};

export default function Achievements() {
  const { currentUser, db, totalXp } = useStore();
  if (!currentUser) return null;
  const earned = db.userAchievements.filter((a) => a.userId === currentUser.id);
  const earnedIds = new Set(earned.map((a) => a.achievementId));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Achievements"
        title="Badges of Quantum Honour"
        sub="Earn badges by learning, experimenting, and staying consistent. Every badge adds XP to your total."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge color="violet">
          <Trophy className="h-3.5 w-3.5" /> {earned.length}/{ACHIEVEMENTS.length} unlocked
        </Badge>
        <Badge color="amber">Total: {totalXp} XP</Badge>
        <span className="text-sm text-slate-500">
          Next:{" "}
          {ACHIEVEMENTS.filter((a) => !earnedIds.has(a.id)).slice(0, 1).map((a) => a.name)[0] ?? "everything earned! 🎉"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const isEarned = earnedIds.has(a.id);
          const info = earned.find((e) => e.achievementId === a.id);
          return (
            <Card
              key={a.id}
              className={`relative p-5 transition ${isEarned ? "border-qx-amber/40 bg-gradient-to-br from-qx-amber/10 to-transparent" : "opacity-80"}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isEarned ? "bg-gradient-to-br from-qx-amber/30 to-qx-violet/20 text-qx-amber shadow-glow" : "bg-white/5 text-slate-600"
                  }`}
                >
                  {isEarned ? (ICONS[a.icon] ?? <Trophy className="h-5 w-5" />) : <Lock className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <h3 className={`font-semibold ${isEarned ? "text-white" : "text-slate-400"}`}>{a.name}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{a.description}</p>
                  <div className="mt-2">
                    {isEarned ? (
                      <Badge color="amber">
                        <Trophy className="h-3 w-3" /> +{a.xp} XP ·{" "}
                        {info ? new Date(info.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                      </Badge>
                    ) : (
                      <Badge color="slate">Locked</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}