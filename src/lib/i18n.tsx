// ── Qubit-X i18n: multilingual vernacular learning system ───────────────────
// Two layers:
//  1. UI strings — keyed catalog (never English sentences as keys), English fallback.
//  2. Engine/AI-generated sentences — `localizeGenerated(en, lang)` matches the
//     English source against a rule table and rebuilds the sentence from a
//     per-language template. Circuit notation (H(q0), CNOT(q0,q1), |00⟩, 50%)
//     is carried as opaque {tokens}, so it passes through untouched in every
//     locale. Unmatched sentences fall back to English — never "undefined".
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useStore } from "./store";
import type { Language } from "../types";

// ── Language registry ────────────────────────────────────────────────────────
// Adding a language = extend the Language union in types.ts, add entries to
// LANGUAGES / TERMS / catalogs / TEMPLATES below. `dir` prepares for RTL.
export const LANGUAGES: { code: Language; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
];

export const LANG_DIR: Record<Language, "ltr" | "rtl"> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.dir]),
) as Record<Language, "ltr" | "rtl">;

// ── Controlled technical terminology ─────────────────────────────────────────
// Consistent forms used across the platform. Gate symbols, kets, qubit ids,
// framework names and code never enter this table — they are language tokens.
export const TERMS: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    qubit: "qubit",
    superposition: "superposition",
    entanglement: "entanglement",
    measurement: "measurement",
    "quantum state": "quantum state",
    "quantum gate": "quantum gate",
    probability: "probability",
    statevector: "statevector",
    "quantum circuit": "circuit",
    interference: "interference",
    "quantum algorithm": "quantum algorithm",
    "quantum computer": "quantum computer",
    "Bloch sphere": "Bloch sphere",
  },
  fr: {
    qubit: "qubit",
    superposition: "superposition quantique",
    entanglement: "intrication",
    measurement: "mesure",
    "quantum state": "état quantique",
    "quantum gate": "porte quantique",
    probability: "probabilité",
    statevector: "vecteur d'état",
    "quantum circuit": "circuit quantique",
    interference: "interférence",
    "quantum algorithm": "algorithme quantique",
    "quantum computer": "ordinateur quantique",
    "Bloch sphere": "sphère de Bloch",
  },
  de: {
    qubit: "Qubit",
    superposition: "Superposition",
    entanglement: "Verschränkung",
    measurement: "Messung",
    "quantum state": "Quantenzustand",
    "quantum gate": "Quantengatter",
    probability: "Wahrscheinlichkeit",
    statevector: "Zustandsvektor",
    "quantum circuit": "Quantenschaltkreis",
    interference: "Interferenz",
    "quantum algorithm": "Quantenalgorithmus",
    "quantum computer": "Quantencomputer",
    "Bloch sphere": "Bloch-Kugel",
  },
};

// ── UI catalog ───────────────────────────────────────────────────────────────
const EN: Record<string, string> = {
  home: "Home", learn: "Learn", quantumLab: "Quantum Lab", aiTutor: "AI Tutor",
  aiChallenges: "AI Challenges", dashboard: "Dashboard", learningPath: "Learning Path",
  visualize: "Visualize", algorithms: "Algorithms", experiments: "Experiments",
  dailyChallenges: "Daily Challenges", diagnostic: "Diagnostic", progress: "Progress",
  achievements: "Achievements", profile: "Profile", resources: "Resources", more: "More",
  admin: "Admin Panel", login: "Log in", createAccount: "Create account", logout: "Log out",
  language: "Language", lessons: "Lessons", practice: "Practice", clearConversation: "Clear conversation",
  closeTutor: "Close tutor", askAiTutor: "Ask AI Tutor", fullTutor: "Full tutor",
  relevantNow: "Relevant right now", grounded: "Grounded — never invents quantum facts",
  explain: "Explain", hint: "Hint", stepByStep: "Step-by-step", challenge: "Challenge",
  simplify: "Simplify", advanced: "Advanced", explainSimply: "Explain simply",
  analogy: "Give an analogy", showMath: "Show the math", goDeeper: "Go deeper",
  responseLanguage: "Response language",
  initialState: "Initial state", finalState: "Final state", entanglement: "Entanglement",
  entangled: "Entangled", notEntangled: "Not entangled",
  explainCircuit: "Explain My Circuit", debugCircuit: "Debug My Circuit",
  compareFrameworks: "Compare Frameworks", idealVsNoisy: "Ideal vs Noisy",
  noProblems: "No problems detected.", languageSaved: "Language preference saved.",
  why: "Why", debugNoEntangled: "The circuit produces a genuinely entangled state.",
  debugNoSimple: "The circuit's behaviour matches its structure.",
  welcomeBack: "Welcome back", overallProgress: "Overall progress", currentStreak: "Current streak",
  level: "Level", continueLearning: "Continue Learning", browseLessons: "Browse all lessons",
  yourQuantumJourney: "Your Quantum Journey", whatLearnNext: "What should I learn next?",
  runDiagnostic: "Run diagnostic", recommendedNext: "Recommended next",
  avgQuiz: "avg quiz score", noQuizzes: "no quizzes yet", ofModules: "of 10 modules",
  xpTotal: "XP total", keepBurning: "Keep it burning 🔥", badgesEarned: "Badges earned",
  days: "days", reason: "Reason", startChallenge: "Start adapted challenge", viewFullPath: "View full path",
  noRecYet: "Complete a lesson, quiz or circuit and I'll recommend the next step here.",
  goal: "Goal", mode: "mode", myLearningPath: "My Learning Path", fullAnalytics: "Full analytics",
  nextUp: "Next up", module: "Module", continueLesson: "Continue lesson", startLesson: "Start lesson",
  allDone: "You've completed every lesson!", allDoneSub: "Visit the Quantum Lab or try today's challenge.",
  day: "day",
};

const HI: Record<string, string> = {
  home: "होम", learn: "सीखें", quantumLab: "Quantum Lab", aiTutor: "AI Tutor",
  aiChallenges: "AI Challenges", dashboard: "डैशबोर्ड", learningPath: "Learning Path",
  visualize: "Visualize", algorithms: "Algorithms", experiments: "Experiments",
  dailyChallenges: "Daily Challenges", diagnostic: "Diagnostic", progress: "Progress",
  achievements: "Achievements", profile: "प्रोफ़ाइल", resources: "Resources", more: "अधिक",
  admin: "Admin Panel", login: "लॉग इन", createAccount: "खाता बनाएं", logout: "लॉग आउट",
  language: "भाषा", lessons: "Lessons", practice: "Practice", clearConversation: "बातचीत साफ़ करें",
  closeTutor: "Tutor बंद करें", askAiTutor: "AI Tutor से पूछें", fullTutor: "पूरा Tutor",
  relevantNow: "अभी प्रासंगिक", grounded: "सत्यापित — quantum facts नहीं गढ़ता",
  explain: "समझाएं", hint: "संकेत", stepByStep: "चरण-दर-चरण", challenge: "Challenge",
  simplify: "सरल करें", advanced: "Advanced", explainSimply: "सरल भाषा में समझाएं",
  analogy: "उदाहरण दें", showMath: "गणित दिखाएं", goDeeper: "और गहराई में जाएं",
  responseLanguage: "उत्तर की भाषा",
  initialState: "प्रारंभिक स्थिति", finalState: "अंतिम स्थिति", entanglement: "Entanglement",
  entangled: "Entangled", notEntangled: "Entangled नहीं",
  explainCircuit: "मेरा Circuit समझाएं", debugCircuit: "मेरा Circuit Debug करें",
  compareFrameworks: "Frameworks की तुलना", idealVsNoisy: "Ideal बनाम Noisy",
  noProblems: "कोई समस्या नहीं मिली।", languageSaved: "भाषा प्राथमिकता सहेजी गई।",
  why: "क्यों", debugNoEntangled: "यह circuit वास्तव में entangled अवस्था बनाता है।",
  debugNoSimple: "Circuit का व्यवहार उसकी संरचना से मेल खाता है।",
  welcomeBack: "वापसी पर स्वागत है", overallProgress: "समग्र प्रगति", currentStreak: "वर्तमान स्ट्रीक",
  level: "स्तर", continueLearning: "सीखना जारी रखें", browseLessons: "सभी पाठ देखें",
  yourQuantumJourney: "आपकी Quantum यात्रा", whatLearnNext: "अगला क्या सीखें?",
  runDiagnostic: "Diagnostic चलाएं", recommendedNext: "अनुशंसित अगला कदम",
  avgQuiz: "avg quiz score", noQuizzes: "अभी कोई quiz नहीं", ofModules: "of 10 modules",
  xpTotal: "XP total", keepBurning: "Keep it burning 🔥", badgesEarned: "Badges earned",
  days: "दिन", reason: "कारण", startChallenge: "Adapted challenge शुरू करें", viewFullPath: "पूरा path देखें",
  noRecYet: "कोई lesson, quiz या circuit पूरा करें, मैं अगला कदम यहाँ सुझाऊँगा।",
  goal: "लक्ष्य", mode: "mode", myLearningPath: "मेरा Learning Path", fullAnalytics: "पूरा analytics",
  nextUp: "अगला", module: "Module", continueLesson: "Lesson जारी रखें", startLesson: "Lesson शुरू करें",
  allDone: "आपने हर lesson पूरा कर लिया!", allDoneSub: "Quantum Lab देखें या आज का challenge आज़माएँ।",
  day: "दिन",
};

const FR: Record<string, string> = {
  home: "Accueil", learn: "Apprendre", quantumLab: "Quantum Lab", aiTutor: "AI Tutor",
  aiChallenges: "AI Challenges", dashboard: "Tableau de bord", learningPath: "Parcours d'apprentissage",
  visualize: "Visualiser", algorithms: "Algorithmes", experiments: "Expériences",
  dailyChallenges: "Défis quotidiens", diagnostic: "Diagnostic", progress: "Progression",
  achievements: "Succès", profile: "Profil", resources: "Ressources", more: "Plus",
  admin: "Panneau admin", login: "Se connecter", createAccount: "Créer un compte", logout: "Se déconnecter",
  language: "Langue", lessons: "Leçons", practice: "Pratique", clearConversation: "Effacer la conversation",
  closeTutor: "Fermer le tutor", askAiTutor: "Demander à l'AI Tutor", fullTutor: "Tutor complet",
  relevantNow: "Pertinent maintenant", grounded: "Vérifié — n'invente pas de faits quantiques",
  explain: "Expliquer", hint: "Indice", stepByStep: "Étape par étape", challenge: "Défi",
  simplify: "Simplifier", advanced: "Avancé", explainSimply: "Expliquer simplement",
  analogy: "Donner une analogie", showMath: "Afficher les maths", goDeeper: "Aller plus loin",
  responseLanguage: "Langue des réponses",
  initialState: "État initial", finalState: "État final", entanglement: "Entanglement",
  entangled: "Entangled", notEntangled: "Non entangled",
  explainCircuit: "Expliquer mon circuit", debugCircuit: "Déboguer mon circuit",
  compareFrameworks: "Comparer les frameworks", idealVsNoisy: "Idéal vs bruité",
  noProblems: "Aucun problème détecté.", languageSaved: "Préférence de langue enregistrée.",
  why: "Pourquoi", debugNoEntangled: "Le circuit produit un état réellement entangled.",
  debugNoSimple: "Le comportement du circuit correspond à sa structure.",
  welcomeBack: "Bon retour", overallProgress: "Progression globale", currentStreak: "Série actuelle",
  level: "Niveau", continueLearning: "Continuer l'apprentissage", browseLessons: "Voir toutes les leçons",
  yourQuantumJourney: "Votre parcours quantique", whatLearnNext: "Qu'apprendre ensuite ?",
  runDiagnostic: "Lancer le diagnostic", recommendedNext: "Prochaine étape recommandée",
  avgQuiz: "score moyen aux quiz", noQuizzes: "aucun quiz pour l'instant", ofModules: "sur 10 modules",
  xpTotal: "XP au total", keepBurning: "Continuez 🔥", badgesEarned: "Badges obtenus",
  days: "jours", reason: "Raison", startChallenge: "Commencer le défi adapté", viewFullPath: "Voir le parcours complet",
  noRecYet: "Terminez une leçon, un quiz ou un circuit et je recommanderai la prochaine étape ici.",
  goal: "Objectif", mode: "mode", myLearningPath: "Mon parcours", fullAnalytics: "Analytics complètes",
  nextUp: "À suivre", module: "Module", continueLesson: "Continuer la leçon", startLesson: "Commencer la leçon",
  allDone: "Vous avez terminé toutes les leçons !", allDoneSub: "Visitez le Quantum Lab ou essayez le défi du jour.",
  day: "jour",
};

const DE: Record<string, string> = {
  home: "Startseite", learn: "Lernen", quantumLab: "Quantum Lab", aiTutor: "AI Tutor",
  aiChallenges: "AI Challenges", dashboard: "Dashboard", learningPath: "Lernpfad",
  visualize: "Visualisieren", algorithms: "Algorithmen", experiments: "Experimente",
  dailyChallenges: "Tägliche Challenges", diagnostic: "Diagnose", progress: "Fortschritt",
  achievements: "Erfolge", profile: "Profil", resources: "Ressourcen", more: "Mehr",
  admin: "Adminbereich", login: "Anmelden", createAccount: "Konto erstellen", logout: "Abmelden",
  language: "Sprache", lessons: "Lektionen", practice: "Üben", clearConversation: "Gespräch löschen",
  closeTutor: "Tutor schließen", askAiTutor: "AI Tutor fragen", fullTutor: "Vollständiger Tutor",
  relevantNow: "Jetzt relevant", grounded: "Fundiert — erfindet keine Quantum-Fakten",
  explain: "Erklären", hint: "Hinweis", stepByStep: "Schritt für Schritt", challenge: "Challenge",
  simplify: "Vereinfachen", advanced: "Fortgeschritten", explainSimply: "Einfach erklären",
  analogy: "Analogie geben", showMath: "Mathematik zeigen", goDeeper: "Mehr Details",
  responseLanguage: "Antwortsprache",
  initialState: "Anfangszustand", finalState: "Endzustand", entanglement: "Entanglement",
  entangled: "Entangled", notEntangled: "Nicht entangled",
  explainCircuit: "Meinen Circuit erklären", debugCircuit: "Meinen Circuit debuggen",
  compareFrameworks: "Frameworks vergleichen", idealVsNoisy: "Ideal vs. verrauscht",
  noProblems: "Keine Probleme erkannt.", languageSaved: "Spracheinstellung gespeichert.",
  why: "Warum", debugNoEntangled: "Der Circuit erzeugt einen wirklich verschränkten Zustand.",
  debugNoSimple: "Das Verhalten des Circuits entspricht seiner Struktur.",
  welcomeBack: "Willkommen zurück", overallProgress: "Gesamtfortschritt", currentStreak: "Aktuelle Serie",
  level: "Level", continueLearning: "Weiterlernen", browseLessons: "Alle Lektionen ansehen",
  yourQuantumJourney: "Deine Quantum-Reise", whatLearnNext: "Was solltest du als Nächstes lernen?",
  runDiagnostic: "Diagnose starten", recommendedNext: "Nächster empfohlener Schritt",
  avgQuiz: "Ø Quiz-Score", noQuizzes: "noch keine Quizze", ofModules: "von 10 Modulen",
  xpTotal: "XP gesamt", keepBurning: "Bleib dran 🔥", badgesEarned: "Abzeichen verdient",
  days: "Tage", reason: "Grund", startChallenge: "Angepasste Challenge starten", viewFullPath: "Gesamten Pfad ansehen",
  noRecYet: "Schließe eine Lektion, ein Quiz oder einen Circuit ab — dann empfehle ich hier den nächsten Schritt.",
  goal: "Ziel", mode: "Modus", myLearningPath: "Mein Lernpfad", fullAnalytics: "Alle Analytics",
  nextUp: "Als Nächstes", module: "Modul", continueLesson: "Lektion fortsetzen", startLesson: "Lektion starten",
  allDone: "Du hast jede Lektion abgeschlossen!", allDoneSub: "Besuche das Quantum Lab oder probiere die heutige Challenge.",
  day: "Tag",
};

const CATALOG: Record<Language, Record<string, string>> = { en: EN, hi: HI, fr: FR, de: DE };

// ── Engine/AI sentence localization ──────────────────────────────────────────
type TplKey = string;

// English templates double as the DEFAULT (fallback) templates.
const EN_TPL: Record<TplKey, string> = {
  // aiService GATE_EFFECT fragments (rendered after the gate symbol, e.g. "H(q0) <fragment>.")
  "eff.h": "places {qubit} into an equal superposition of |0⟩ and |1⟩, with a phase sign that matters later",
  "eff.x": "flips {qubit} (|0⟩ ↔ |1⟩)",
  "eff.y": "flips {qubit} and adds a phase — a 180° rotation about the Y axis",
  "eff.z": "applies a phase flip to {qubit} (|1⟩ → −|1⟩), invisible to measurement but real in the state",
  "eff.s": "rotates the phase of {qubit} by 90° (|1⟩ → i|1⟩)",
  "eff.t": "rotates the phase of {qubit} by 45° (|1⟩ → e^{iπ/4}|1⟩)",
  "eff.cnot": "makes {target} depend on {control}: the target flips only when the control is |1⟩",
  "eff.swap": "exchanges the states of {a} and {b}",
  "eff.m": "measures {qubit}, collapsing it to a definite 0 or 1",
  // explainCircuitStructured sentences
  "exp.starts": "Your circuit starts from {state} and applies {n} gate{s}.",
  "exp.entangled": "The two qubits end up genuinely entangled — their outcomes are correlated, not independent.",
  "exp.outcomes": "If measured now, the outcomes would be: {outcomes}.",
  "exp.measured": "Because your circuit includes measurement, a single run collapses to one of those outcomes — the distribution describes the odds across many runs.",
  // simulator.explainCircuit sentences (Lab "What happened?")
  "sim.h": "The Hadamard (H) gate on qubit {q} placed it into an equal superposition of |0⟩ and |1⟩.",
  "sim.x": "The X gate on qubit {q} flipped it (|0⟩ ↔ |1⟩).",
  "sim.y": "The Y gate on qubit {q} rotated it around the Y axis of the Bloch sphere.",
  "sim.z": "The Z gate on qubit {q} applied a phase flip (|1⟩ → −|1⟩).",
  "sim.s": "The S gate on qubit {q} rotated its phase by 90° (|1⟩ → i|1⟩).",
  "sim.t": "The T gate on qubit {q} rotated its phase by 45° (|1⟩ → e^(iπ/4)|1⟩).",
  "sim.cnot": "The CNOT gate entangled qubit {a} (control) with qubit {b} (target): when the control is |1⟩, the target flips.",
  "sim.swap": "The SWAP gate exchanged the states of qubits {a} and {b}.",
  "sim.m": "Qubit {q} was measured, collapsing it to a definite 0 or 1.",
  "sim.empty": "The circuit is empty. Every qubit starts in |0⟩, so measuring now would give 0 for every qubit.",
  // engine debugCircuit summary + top issues (issue / why / hint)
  "dbg.ok": "No problems found — this circuit is structurally sound and behaves as you'd expect.",
  "dbg.count": "{n} thing{s} worth looking at, most important first.",
  "dbg.empty": "Your circuit is empty.",
  "dbg.emptyWhy": "Every qubit starts in |0⟩, so measuring now would give 0 for every qubit.",
  "dbg.emptyHint": "Add a gate from the palette to get started — try H for superposition, X to flip.",
  "dbg.nothingToRun": "Nothing to run yet — add at least one gate.",
  "dbg.cnotSame": "A CNOT gate has its control and target on the same qubit.",
  "dbg.cnotSameWhy": "A conditional flip needs two different qubits — one to decide, one to flip.",
  "dbg.cnotSameHint": "Delete that CNOT and place the control on one wire and the target on another.",
  "dbg.afterMeasure": "A gate is applied to a qubit after that qubit was measured.",
  "dbg.afterMeasureWhy": "Measurement collapses the qubit to a definite 0 or 1, so later gates act on a classical value, not a superposition.",
  "dbg.afterMeasureHint": "Move all measurement gates to the end of the circuit (rightmost column).",
  "dbg.noEntangle": "Your circuit is unlikely to create an entangled state.",
  "dbg.noEntangleWhy": "Starting from |00⟩, a CNOT alone only ever sees a control of |0⟩, so it never flips anything. Entanglement needs the control in a superposition first.",
  "dbg.noEntangleHint": "Try applying a Hadamard gate to the control qubit before the CNOT.",
  "dbg.doubleH": "Two Hadamard gates in a row on qubit {q} cancel each other out.",
  "dbg.doubleHWhy": "H is its own inverse (H·H = identity), so the pair leaves the qubit exactly where it started.",
};

const HI_TPL: Partial<Record<TplKey, string>> = {
  "eff.h": "{qubit} को |0⟩ और |1⟩ की बराबर superposition में रखता है, जिसका phase sign आगे काम आता है",
  "eff.x": "{qubit} को बदलता है (|0⟩ ↔ |1⟩)",
  "eff.y": "{qubit} को बदलकर phase जोड़ता है — Y अक्ष पर 180° का घूर्णन",
  "eff.z": "{qubit} पर phase flip लगाता है (|1⟩ → −|1⟩), measurement में नहीं दिखता पर अवस्था में वास्तविक है",
  "eff.s": "{qubit} के phase को 90° घुमाता है (|1⟩ → i|1⟩)",
  "eff.t": "{qubit} के phase को 45° घुमाता है (|1⟩ → e^{iπ/4}|1⟩)",
  "eff.cnot": "{target} को {control} पर निर्भर बनाता है: target केवल तब flip होता है जब control |1⟩ हो",
  "eff.swap": "{a} और {b} की अवस्थाएँ आपस में बदल देता है",
  "eff.m": "{qubit} को measure करता है, जिससे वह निश्चित 0 या 1 हो जाता है",
  "exp.starts": "आपका circuit {state} से शुरू होकर {n} gate लगाता है।",
  "exp.entangled": "दोनों qubits वास्तव में entangled हो जाते हैं — उनके परिणाम संबंधित होते हैं, स्वतंत्र नहीं।",
  "exp.outcomes": "अभी measure करने पर परिणाम होंगे: {outcomes}।",
  "exp.measured": "आपके circuit में measurement होने के कारण एक बार चलाने पर परिणाम इन्हीं में से एक होगा — यह distribution कई बार चलाने की संभावनाएँ दिखाती है।",
  "sim.h": "Hadamard (H) gate ने qubit {q} को |0⟩ और |1⟩ की बराबर superposition में रखा।",
  "sim.x": "X gate ने qubit {q} को बदल दिया (|0⟩ ↔ |1⟩)।",
  "sim.y": "Y gate ने qubit {q} को Bloch sphere की Y अक्ष पर घुमाया।",
  "sim.z": "Z gate ने qubit {q} पर phase flip लगाया (|1⟩ → −|1⟩)।",
  "sim.s": "S gate ने qubit {q} के phase को 90° घुमाया (|1⟩ → i|1⟩)।",
  "sim.t": "T gate ने qubit {q} के phase को 45° घुमाया (|1⟩ → e^(iπ/4)|1⟩)।",
  "sim.cnot": "CNOT gate ने qubit {a} (control) और qubit {b} (target) के बीच entanglement बनाया: control |1⟩ होने पर target flip होता है।",
  "sim.swap": "SWAP gate ने qubits {a} और {b} की अवस्थाएँ आपस में बदल दीं।",
  "sim.m": "Qubit {q} को measure किया गया, जिससे वह निश्चित 0 या 1 हो गया।",
  "sim.empty": "Circuit खाली है। हर qubit |0⟩ से शुरू होता है, इसलिए अभी measure करने पर हर qubit के लिए 0 मिलेगा।",
  "sim.headerM": "आपका circuit {gates} gates लगाता है और qubits को measure करता है।",
  "sim.headerNoM": "आपका circuit {gates} gates लगाता है, बिना measure किए।",
  "sim.trailerM": "अंतिम measurement दिखाई गई probability distribution से sample किया जाता है।",
  "sim.trailerNoM": "Probability distribution दिखाती है कि अभी measure करने पर क्या दिखता।",
  "fu.challenge": "मुझे {topic} का challenge दें",
  "fu.analogy": "{topic} को उदाहरण से समझाएं",
  "fu.math": "{topic} के पीछे का गणित क्या है?",
  "dbg.ok": "कोई समस्या नहीं — यह circuit संरचनात्मक रूप से सही है और अपेक्षा के अनुसार व्यवहार करता है।",
  "dbg.count": "{n} बातें ध्यान देने योग्य हैं, सबसे महत्वपूर्ण पहले।",
  "dbg.empty": "आपका circuit खाली है।",
  "dbg.emptyWhy": "हर qubit |0⟩ से शुरू होता है, इसलिए अभी measure करने पर हर qubit के लिए 0 मिलेगा।",
  "dbg.emptyHint": "शुरू करने के लिए palette से एक gate जोड़ें — superposition के लिए H, flip के लिए X आज़माएँ।",
  "dbg.nothingToRun": "अभी चलाने के लिए कुछ नहीं — कम से कम एक gate जोड़ें।",
  "dbg.cnotSame": "एक CNOT gate का control और target एक ही qubit पर है।",
  "dbg.cnotSameWhy": "सशर्त flip के लिए दो अलग qubits चाहिए — एक तय करने के लिए, एक बदलने के लिए।",
  "dbg.cnotSameHint": "उस CNOT को हटाएँ और control को एक wire पर, target को दूसरे पर रखें।",
  "dbg.afterMeasure": "किसी qubit के measure होने के बाद उस पर gate लगाया गया है।",
  "dbg.afterMeasureWhy": "Measurement qubit को निश्चित 0 या 1 में बदल देता है, इसलिए बाद के gates superposition पर नहीं, classical मान पर काम करते हैं।",
  "dbg.afterMeasureHint": "सभी measurement gates को circuit के अंत (सबसे दाएँ column) में ले जाएँ।",
  "dbg.noEntangle": "आपका circuit entangled अवस्था बनाने में सक्षम नहीं दिखता।",
  "dbg.noEntangleWhy": "|00⟩ से शुरू होकर, अकेला CNOT केवल control |0⟩ देखता है, इसलिए कभी कुछ flip नहीं होता। Entanglement के लिए control को पहले superposition में होना चाहिए।",
  "dbg.noEntangleHint": "CNOT से पहले control qubit पर Hadamard gate लगाने की कोशिश करें।",
  "dbg.doubleH": "qubit {q} पर लगातार दो Hadamard gates एक-दूसरे को निरस्त कर देते हैं।",
  "dbg.doubleHWhy": "H अपना ही inverse है (H·H = identity), इसलिए यह जोड़ा qubit को ठीक वहीं छोड़ देता है जहाँ वह था।",
};

const FR_TPL: Partial<Record<TplKey, string>> = {
  "eff.h": "place {qubit} dans une superposition égale de |0⟩ et |1⟩, avec un signe de phase qui compte ensuite",
  "eff.x": "inverse {qubit} (|0⟩ ↔ |1⟩)",
  "eff.y": "inverse {qubit} et ajoute une phase — rotation de 180° autour de l'axe Y",
  "eff.z": "applique un retournement de phase à {qubit} (|1⟩ → −|1⟩), invisible à la mesure mais réel dans l'état",
  "eff.s": "fait tourner la phase de {qubit} de 90° (|1⟩ → i|1⟩)",
  "eff.t": "fait tourner la phase de {qubit} de 45° (|1⟩ → e^{iπ/4}|1⟩)",
  "eff.cnot": "rend {target} dépendant de {control} : la cible s'inverse seulement quand le contrôle vaut |1⟩",
  "eff.swap": "échange les états de {a} et {b}",
  "eff.m": "mesure {qubit}, qui se réduit alors à un 0 ou un 1 definite",
  "exp.starts": "Votre circuit part de {state} et applique {n} porte{s}.",
  "exp.entangled": "Les deux qubits finissent réellement entangled — leurs résultats sont corrélés, pas indépendants.",
  "exp.outcomes": "Si on mesure maintenant, les résultats seraient : {outcomes}.",
  "exp.measured": "Comme votre circuit inclut une mesure, une exécution se réduit à l'un de ces résultats — la distribution décrit les probabilités sur de nombreuses exécutions.",
  "sim.h": "La porte Hadamard (H) a placé le qubit {q} dans une superposition égale de |0⟩ et |1⟩.",
  "sim.x": "La porte X a inversé le qubit {q} (|0⟩ ↔ |1⟩).",
  "sim.y": "La porte Y a fait tourner le qubit {q} autour de l'axe Y de la sphère de Bloch.",
  "sim.z": "La porte Z a appliqué un retournement de phase au qubit {q} (|1⟩ → −|1⟩).",
  "sim.s": "La porte S a fait tourner la phase du qubit {q} de 90° (|1⟩ → i|1⟩).",
  "sim.t": "La porte T a fait tourner la phase du qubit {q} de 45° (|1⟩ → e^(iπ/4)|1⟩).",
  "sim.cnot": "La porte CNOT a intriqué le qubit {a} (contrôle) avec le qubit {b} (cible) : quand le contrôle vaut |1⟩, la cible s'inverse.",
  "sim.swap": "La porte SWAP a échangé les états des qubits {a} et {b}.",
  "sim.m": "Le qubit {q} a été mesuré, se réduisant à un 0 ou un 1 definite.",
  "sim.empty": "Le circuit est vide. Chaque qubit démarre en |0⟩, donc une mesure maintenant donnerait 0 pour chaque qubit.",
  "sim.headerM": "Votre circuit applique {gates} comme portes et mesure les qubits.",
  "sim.headerNoM": "Votre circuit applique {gates} comme portes sans mesurer.",
  "sim.trailerM": "La mesure finale est tirée de la distribution de probabilités affichée.",
  "sim.trailerNoM": "La distribution de probabilités montre ce que vous verriez en mesurant maintenant.",
  "fu.challenge": "Donnez-moi un défi sur {topic}",
  "fu.analogy": "Expliquez {topic} avec une analogie",
  "fu.math": "Quelles sont les maths derrière {topic} ?",
  "dbg.ok": "Aucun problème trouvé — ce circuit est structurellement sain et se comporte comme prévu.",
  "dbg.count": "{n} point{s} à examiner, le plus important d'abord.",
  "dbg.empty": "Votre circuit est vide.",
  "dbg.emptyWhy": "Chaque qubit démarre en |0⟩, donc une mesure maintenant donnerait 0 pour chaque qubit.",
  "dbg.emptyHint": "Ajoutez une porte depuis la palette pour commencer — essayez H pour la superposition, X pour inverser.",
  "dbg.nothingToRun": "Rien à exécuter pour l'instant — ajoutez au moins une porte.",
  "dbg.cnotSame": "Une porte CNOT a son contrôle et sa cible sur le même qubit.",
  "dbg.cnotSameWhy": "Un retournement conditionnel nécessite deux qubits différents — l'un décide, l'autre s'inverse.",
  "dbg.cnotSameHint": "Supprimez ce CNOT et placez le contrôle sur un fil et la cible sur un autre.",
  "dbg.afterMeasure": "Une porte est appliquée à un qubit après que celui-ci a été mesuré.",
  "dbg.afterMeasureWhy": "La mesure réduit le qubit à un 0 ou un 1 definite ; les portes suivantes agissent donc sur une valeur classique, pas une superposition.",
  "dbg.afterMeasureHint": "Déplacez toutes les portes de mesure à la fin du circuit (colonne la plus à droite).",
  "dbg.noEntangle": "Votre circuit ne semble pas capable de créer un état entangled.",
  "dbg.noEntangleWhy": "En partant de |00⟩, un CNOT seul ne voit jamais qu'un contrôle |0⟩ et n'inverse donc rien. L'entanglement exige un contrôle en superposition d'abord.",
  "dbg.noEntangleHint": "Essayez d'appliquer une porte Hadamard au qubit de contrôle avant le CNOT.",
  "dbg.doubleH": "Deux portes Hadamard d'affilée sur le qubit {q} s'annulent.",
  "dbg.doubleHWhy": "H est son propre inverse (H·H = identité), donc la paire laisse le qubit exactement où il était.",
};

const DE_TPL: Partial<Record<TplKey, string>> = {
  "eff.h": "versetzt {qubit} in eine gleichmäßige Superposition aus |0⟩ und |1⟩, mit einem Phasenvorzeichen, das später wichtig wird",
  "eff.x": "kippt {qubit} (|0⟩ ↔ |1⟩)",
  "eff.y": "kippt {qubit} und fügt eine Phase hinzu — 180°-Drehung um die Y-Achse",
  "eff.z": "wendet einen Phasenflip auf {qubit} an (|1⟩ → −|1⟩), in der Messung unsichtbar, im Zustand aber real",
  "eff.s": "dreht die Phase von {qubit} um 90° (|1⟩ → i|1⟩)",
  "eff.t": "dreht die Phase von {qubit} um 45° (|1⟩ → e^{iπ/4}|1⟩)",
  "eff.cnot": "macht {target} abhängig von {control}: Das Ziel kippt nur, wenn die Kontrolle |1⟩ ist",
  "eff.swap": "tauscht die Zustände von {a} und {b}",
  "eff.m": "misst {qubit}, das dadurch auf ein bestimmtes 0 oder 1 zusammenbricht",
  "exp.starts": "Dein Circuit beginnt bei {state} und wendet {n} Gatter an.",
  "exp.entangled": "Die beiden Qubits enden wirklich entangled — ihre Ergebnisse sind korreliert, nicht unabhängig.",
  "exp.outcomes": "Misst man jetzt, wären die Ergebnisse: {outcomes}.",
  "exp.measured": "Da dein Circuit eine Messung enthält, bricht eine einzelne Ausführung auf eines dieser Ergebnisse zusammen — die Verteilung beschreibt die Wahrscheinlichkeiten über viele Ausführungen.",
  "sim.h": "Das Hadamard-Gatter (H) hat Qubit {q} in eine gleichmäßige Superposition aus |0⟩ und |1⟩ versetzt.",
  "sim.x": "Das X-Gatter hat Qubit {q} gekippt (|0⟩ ↔ |1⟩).",
  "sim.y": "Das Y-Gatter hat Qubit {q} um die Y-Achse der Bloch-Kugel gedreht.",
  "sim.z": "Das Z-Gatter hat auf Qubit {q} einen Phasenflip angewendet (|1⟩ → −|1⟩).",
  "sim.s": "Das S-Gatter hat die Phase von Qubit {q} um 90° gedreht (|1⟩ → i|1⟩).",
  "sim.t": "Das T-Gatter hat die Phase von Qubit {q} um 45° gedreht (|1⟩ → e^(iπ/4)|1⟩).",
  "sim.cnot": "Das CNOT-Gatter hat Qubit {a} (Kontrolle) mit Qubit {b} (Ziel) verschränkt: Ist die Kontrolle |1⟩, kippt das Ziel.",
  "sim.swap": "Das SWAP-Gatter hat die Zustände der Qubits {a} und {b} getauscht.",
  "sim.m": "Qubit {q} wurde gemessen und brach auf ein bestimmtes 0 oder 1 zusammen.",
  "sim.empty": "Der Circuit ist leer. Jedes Qubit startet in |0⟩ — eine Messung würde jetzt für jedes Qubit 0 ergeben.",
  "sim.headerM": "Dein Circuit wendet {gates} als Gatter an und misst die Qubits.",
  "sim.headerNoM": "Dein Circuit wendet {gates} als Gatter an, ohne zu messen.",
  "sim.trailerM": "Die endgültige Messung wird aus der angezeigten Wahrscheinlichkeitsverteilung gezogen.",
  "sim.trailerNoM": "Die Wahrscheinlichkeitsverteilung zeigt, was bei einer Messung jetzt zu sehen wäre.",
  "fu.challenge": "Gib mir eine Challenge zu {topic}",
  "fu.analogy": "Erkläre {topic} mit einer Analogie",
  "fu.math": "Was ist die Mathematik hinter {topic}?",
  "dbg.ok": "Keine Probleme gefunden — dieser Circuit ist strukturell sauber und verhält sich wie erwartet.",
  "dbg.count": "{n} Punkt{e} zu prüfen, der wichtigste zuerst.",
  "dbg.empty": "Dein Circuit ist leer.",
  "dbg.emptyWhy": "Jedes Qubit startet in |0⟩ — eine Messung würde jetzt für jedes Qubit 0 ergeben.",
  "dbg.emptyHint": "Füge ein Gatter aus der Palette hinzu — versuche H für Superposition, X zum Kippen.",
  "dbg.nothingToRun": "Noch nichts auszuführen — füge mindestens ein Gatter hinzu.",
  "dbg.cnotSame": "Ein CNOT-Gatter hat Kontrolle und Ziel auf demselben Qubit.",
  "dbg.cnotSameWhy": "Ein bedingter Flip braucht zwei verschiedene Qubits — eins entscheidet, eins kippt.",
  "dbg.cnotSameHint": "Lösche dieses CNOT und lege die Kontrolle auf eine Leitung und das Ziel auf eine andere.",
  "dbg.afterMeasure": "Auf ein Qubit wird ein Gatter angewendet, nachdem es gemessen wurde.",
  "dbg.afterMeasureWhy": "Die Messung bricht das Qubit auf ein bestimmtes 0 oder 1 zusammen; spätere Gatter wirken daher auf einen klassischen Wert, nicht auf eine Superposition.",
  "dbg.afterMeasureHint": "Verschiebe alle Messgatter ans Ende des Circuits (rechte Spalte).",
  "dbg.noEntangle": "Dein Circuit erzeugt wahrscheinlich keinen verschränkten Zustand.",
  "dbg.noEntangleWhy": "Aus |00⟩ sieht ein einzelnes CNOT immer nur eine Kontrolle |0⟩ und kippt nie etwas. Verschränkung braucht zuerst eine Kontrolle in Superposition.",
  "dbg.noEntangleHint": "Versuche, vor dem CNOT ein Hadamard-Gatter auf das Kontroll-Qubit anzuwenden.",
  "dbg.doubleH": "Zwei Hadamard-Gatter hintereinander auf Qubit {q} heben sich auf.",
  "dbg.doubleHWhy": "H ist sein eigenes Inverses (H·H = Identität), das Paar lässt das Qubit genau, wo es war.",
};

const TPL: Record<Language, Partial<Record<TplKey, string>>> = {
  en: EN_TPL, hi: HI_TPL, fr: FR_TPL, de: DE_TPL,
};

function fmt(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{${k}}`,
  );
}

// ── Rule table: English source → template key + params ─────────────────────
// Order matters: first match wins. `full` rules match an entire sentence;
// `fragment` rules match a phrase inside a sentence and substitute in place
// (used for GATE_EFFECT fragments rendered after the gate symbol).
interface Rule {
  re: RegExp;
  key: TplKey;
  params: (m: RegExpMatchArray) => Record<string, string | number>;
  fragment?: boolean;
}

const Q = "(q\\d+)";
const RULES: Rule[] = [
  // aiService GATE_EFFECT fragments
  { fragment: true, re: new RegExp(`applies a Hadamard to ${Q} — creating an equal superposition of \\|0⟩ and \\|1⟩, with a phase sign that matters later`), key: "eff.h", params: (m) => ({ qubit: m[1] }) },
  { fragment: true, re: new RegExp(`flips ${Q} \\(\\|0⟩ ↔ \\|1⟩\\)`), key: "eff.x", params: (m) => ({ qubit: m[1] }) },
  { fragment: true, re: new RegExp(`flips ${Q} and adds a phase — a 180° rotation about the Y axis`), key: "eff.y", params: (m) => ({ qubit: m[1] }) },
  { fragment: true, re: new RegExp(`applies a phase flip to ${Q} \\(\\|1⟩ → −\\|1⟩\\), invisible to measurement but real in the state`), key: "eff.z", params: (m) => ({ qubit: m[1] }) },
  { fragment: true, re: new RegExp(`rotates the phase of ${Q} by 90° \\(\\|1⟩ → i\\|1⟩\\)`), key: "eff.s", params: (m) => ({ qubit: m[1] }) },
  { fragment: true, re: new RegExp(`rotates the phase of ${Q} by 45° \\(\\|1⟩ → e\\^\\{iπ/4\\}\\|1⟩\\)`), key: "eff.t", params: (m) => ({ qubit: m[1] }) },
  { fragment: true, re: new RegExp(`makes ${Q} depend on ${Q}: the target flips only when the control is \\|1⟩`), key: "eff.cnot", params: (m) => ({ target: m[1], control: m[2] }) },
  { fragment: true, re: new RegExp(`exchanges the states of ${Q} and ${Q}`), key: "eff.swap", params: (m) => ({ a: m[1], b: m[2] }) },
  { fragment: true, re: new RegExp(`measures ${Q}, collapsing it to a definite 0 or 1`), key: "eff.m", params: (m) => ({ qubit: m[1] }) },
  // explainCircuitStructured sentences
  { re: /^\|(\d+)⟩ -> \|(\d+)⟩$|^Your circuit starts from (\|[^⟩]*⟩) and applies (\d+) gates?\.$/, key: "exp.starts", params: (m) => ({ state: m[3], n: m[4], s: m[4] === "1" ? "" : "s" }) },
  { re: /^The two qubits end up genuinely entangled — their outcomes are correlated, not independent\.$/, key: "exp.entangled", params: () => ({}) },
  { re: /^If measured now, the outcomes would be: (.+)\.$/, key: "exp.outcomes", params: (m) => ({ outcomes: m[1] }) },
  { re: /^Because your circuit includes measurement, a single run collapses to one of those outcomes — the distribution describes the odds across many runs\.$/, key: "exp.measured", params: () => ({}) },
  // simulator.explainCircuit
  { re: /^The Hadamard \(H\) gate on qubit (\d+) placed it into an equal superposition of \|0⟩ and \|1⟩\.$/, key: "sim.h", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The X gate on qubit (\d+) flipped it \(\|0⟩ ↔ \|1⟩\)\.$/, key: "sim.x", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The Y gate on qubit (\d+) rotated it around the Y axis of the Bloch sphere\.$/, key: "sim.y", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The Z gate on qubit (\d+) applied a phase flip \(\|1⟩ → −\|1⟩\)\.$/, key: "sim.z", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The S gate on qubit (\d+) rotated its phase by 90° \(\|1⟩ → i\|1⟩\)\.$/, key: "sim.s", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The T gate on qubit (\d+) rotated its phase by 45° \(\|1⟩ → e\^\(iπ\/4\)\|1⟩\)\.$/, key: "sim.t", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The CNOT gate entangled qubit (\d+) \(control\) with qubit (\d+) \(target\): when the control is \|1⟩, the target flips\.$/, key: "sim.cnot", params: (m) => ({ a: `q${m[1]}`, b: `q${m[2]}` }) },
  { re: /^The SWAP gate exchanged the states of qubits (\d+) and (\d+)\.$/, key: "sim.swap", params: (m) => ({ a: `q${m[1]}`, b: `q${m[2]}` }) },
  { re: /^Qubit (\d+) was measured, collapsing it to a definite 0 or 1\.$/, key: "sim.m", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^The circuit is empty\. Every qubit starts in \|0⟩, so measuring now would give 0 for every qubit\.$/, key: "sim.empty", params: () => ({}) },
  { re: /^Your circuit applies (.*) gates and measures the qubits\.$/, key: "sim.headerM", params: (m) => ({ gates: m[1] }) },
  { re: /^Your circuit applies (.*) gates without measuring\.$/, key: "sim.headerNoM", params: (m) => ({ gates: m[1] }) },
  { re: /^The final measurement is sampled from the probability distribution shown\.$/, key: "sim.trailerM", params: () => ({}) },
  { re: /^The probability distribution shows what you would see if you measured now\.$/, key: "sim.trailerNoM", params: () => ({}) },
  { re: /^Give me a (.+) challenge$/, key: "fu.challenge", params: (m) => ({ topic: m[1] }) },
  { re: /^Explain (.+) with an analogy$/, key: "fu.analogy", params: (m) => ({ topic: m[1] }) },
  { re: /^What's the math behind (.+)\?$/, key: "fu.math", params: (m) => ({ topic: m[1] }) },
  // engine debugCircuit
  { re: /^No problems found — this circuit is structurally sound and behaves as you'd expect\.$/, key: "dbg.ok", params: () => ({}) },
  { re: /^(\d+) things? worth looking at, most important first\.$/, key: "dbg.count", params: (m) => ({ n: m[1], s: m[1] === "1" ? "" : "s", e: m[1] === "1" ? "" : "e" }) },
  { re: /^Your circuit is empty\.$/, key: "dbg.empty", params: () => ({}) },
  { re: /^Every qubit starts in \|0⟩, so measuring now would give 0 for every qubit\.$/, key: "dbg.emptyWhy", params: () => ({}) },
  { re: /^Add a gate from the palette to get started — try H for superposition, X to flip\.$/, key: "dbg.emptyHint", params: () => ({}) },
  { re: /^Nothing to run yet — add at least one gate\.$/, key: "dbg.nothingToRun", params: () => ({}) },
  { re: /^A CNOT gate has its control and target on the same qubit\.$/, key: "dbg.cnotSame", params: () => ({}) },
  { re: /^A conditional flip needs two different qubits — one to decide, one to flip\.$/, key: "dbg.cnotSameWhy", params: () => ({}) },
  { re: /^Delete that CNOT and place the control on one wire and the target on another\.$/, key: "dbg.cnotSameHint", params: () => ({}) },
  { re: /^A gate is applied to a qubit after that qubit was measured\.$/, key: "dbg.afterMeasure", params: () => ({}) },
  { re: /^Measurement collapses the qubit to a definite 0 or 1, so later gates act on a classical value, not a superposition\.$/, key: "dbg.afterMeasureWhy", params: () => ({}) },
  { re: /^Move all measurement gates to the end of the circuit \(rightmost column\)\.$/, key: "dbg.afterMeasureHint", params: () => ({}) },
  { re: /^Your circuit is unlikely to create an entangled state\.$/, key: "dbg.noEntangle", params: () => ({}) },
  { re: /^Starting from \|00⟩, a CNOT alone only ever sees a control of \|0⟩, so it never flips anything\. Entanglement needs the control in a superposition first\.$/, key: "dbg.noEntangleWhy", params: () => ({}) },
  { re: /^Try applying a Hadamard gate to the control qubit before the CNOT\.$/, key: "dbg.noEntangleHint", params: () => ({}) },
  { re: /^Two Hadamard gates in a row on qubit (\d+) cancel each other out\.$/, key: "dbg.doubleH", params: (m) => ({ q: `q${m[1]}` }) },
  { re: /^H is its own inverse \(H·H = identity\), so the pair leaves the qubit exactly where it started\.$/, key: "dbg.doubleHWhy", params: () => ({}) },
];

/**
 * Localize an engine/AI-generated English text into `lang`.
 * Works without React context (usable from services). The text is split into
 * sentences; each sentence is matched against the rule table — full-sentence
 * rules replace it, fragment rules substitute phrases in place. Anything
 * unmatched falls back to the English source — never "undefined".
 */
export function localizeGenerated(en: string, lang: Language): string {
  if (lang === "en" || !en) return en;
  const sentences = en.split(/(?<=[.!?।])\s+(?=[A-Zऀ-ॿA-ZÀ-Þ\d\"'])/);
  return sentences.map((sentence) => {
    // 1. full-sentence rules
    for (const rule of RULES) {
      if (rule.fragment) continue;
      const m = sentence.match(rule.re);
      if (m) {
        const tpl = TPL[lang][rule.key] ?? EN_TPL[rule.key];
        return fmt(tpl, rule.params(m));
      }
    }
    // 2. fragment rules — substitute each matched phrase in place
    let out = sentence;
    for (const rule of RULES) {
      if (!rule.fragment) continue;
      out = out.replace(rule.re, (...args) => {
        const m = args.slice(0, -2).filter((a) => typeof a === "string") as RegExpMatchArray;
        const tpl = TPL[lang][rule.key] ?? EN_TPL[rule.key];
        return fmt(tpl, rule.params(m));
      });
    }
    return out;
  }).join(" ");
}

// ── React provider ───────────────────────────────────────────────────────────
interface I18nValue {
  language: Language;
  setLanguage: (l: Language) => void;
  /** Localized UI string by key; falls back to English, then the key itself. */
  t: (key: string) => string;
  /** Localize an engine/AI sentence in the current UI language. */
  tr: (en: string) => string;
  /** Controlled technical term in the active language. */
  term: (key: string) => string;
  /** Tutor response language: explicit override ?? UI language. */
  tutorLang: Language;
  setTutorLang: (l: Language | null) => void;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nValue | null>(null);

const LANG_KEY = "qx.lang";
const TUTOR_LANG_KEY = "qx.tutorLang";

function loadStored(key: string): Language | null {
  try {
    const v = localStorage.getItem(key);
    return v && LANGUAGES.some((l) => l.code === v) ? (v as Language) : null;
  } catch {
    return null;
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, setPreferredLanguage } = useStore();
  const [language, setLanguageState] = useState<Language>(() => loadStored(LANG_KEY) ?? "en");
  const [tutorOverride, setTutorOverride] = useState<Language | null>(() => loadStored(TUTOR_LANG_KEY));

  // Sync <html lang> + dir for screen readers, fonts and future RTL locales.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = LANG_DIR[language];
  }, [language]);

  // Signed-in users adopt their saved profile preference once per session.
  useEffect(() => {
    const pref = currentUser?.preferredLanguage;
    if (pref && pref !== language) setLanguageState(pref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* private mode */ }
    if (currentUser) setPreferredLanguage(l);
  };

  const setTutorLang = (l: Language | null) => {
    setTutorOverride(l);
    try {
      if (l) localStorage.setItem(TUTOR_LANG_KEY, l);
      else localStorage.removeItem(TUTOR_LANG_KEY);
    } catch { /* private mode */ }
  };

  const tutorLang = tutorOverride ?? language;

  const value = useMemo<I18nValue>(() => ({
    language,
    setLanguage,
    t: (key: string) => CATALOG[language][key] ?? EN[key] ?? key,
    tr: (en: string) => localizeGenerated(en, language),
    term: (key: string) => TERMS[language][key] ?? key,
    tutorLang,
    setTutorLang,
    languages: LANGUAGES,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [language, tutorLang, currentUser?.id]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
