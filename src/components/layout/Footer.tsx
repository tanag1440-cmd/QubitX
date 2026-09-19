import React from "react";
import { Link } from "react-router-dom";
import { Atom } from "lucide-react";
import { useI18n } from "../../lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-line bg-page">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <Atom className="h-4.5 w-4.5 text-white" />
              </span>
              <span className="font-bold text-ink">
                Qubit<span className="text-accent">X</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-3">
              Learn. Simulate. Experiment. Understand Quantum. — An interactive platform for learning quantum
              computing from first principles, no hardware required.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">{t("learn")}</p>
              <ul className="space-y-2 text-sm text-ink-2">
                <li><Link to="/learn" className="hover:text-ink">{t("lessons")}</Link></li>
                <li><Link to="/visualize" className="hover:text-ink">{t("visualize")}</Link></li>
                <li><Link to="/algorithms" className="hover:text-ink">{t("algorithms")}</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">{t("practice")}</p>
              <ul className="space-y-2 text-sm text-ink-2">
                <li><Link to="/lab" className="hover:text-ink">Quantum Lab</Link></li>
                <li><Link to="/challenges" className="hover:text-ink">{t("dailyChallenges")}</Link></li>
                <li><Link to="/tutor" className="hover:text-ink">{t("aiTutor")}</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">{t("more")}</p>
              <ul className="space-y-2 text-sm text-ink-2">
                <li><Link to="/resources" className="hover:text-ink">{t("resources")}</Link></li>
                <li><Link to="/progress" className="hover:text-ink">{t("progress")}</Link></li>
                <li><Link to="/achievements" className="hover:text-ink">{t("achievements")}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-center text-xs text-ink-3">
          QubitX · All simulations run locally in your browser
        </div>
      </div>
    </footer>
  );
}