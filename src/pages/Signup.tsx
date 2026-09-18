import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Compass } from "lucide-react";
import { AuthShell, Field, inputClass } from "../components/auth/AuthShell";
import { Button } from "../components/ui";
import { useStore } from "../lib/store";
import type { Level } from "../types";

const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "Beginner", label: "Beginner", hint: "New to quantum — start from scratch" },
  { id: "Intermediate", label: "Intermediate", hint: "Know the basics, want structure" },
  { id: "Advanced", label: "Advanced", hint: "Comfortable with physics/math" },
];

export default function Signup() {
  const { signup, enterDemo } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState<Level>("Beginner");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = signup(name, email, password, level);
    if (err) {
      setError(err);
      return;
    }
    navigate("/dashboard");
  };

  const demo = () => {
    enterDemo();
    navigate("/dashboard");
  };

  return (
    <AuthShell
      title="Create your account"
      sub="Start your quantum journey in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <Field label="Full name">
          <input
            className={inputClass}
            placeholder="Priya Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            className={inputClass}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="What's your learning level?">
          <div className="grid gap-2">
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition ${
                  level === l.id
                    ? "border-qx-violet/60 bg-qx-violet/10"
                    : "border-line bg-card2/50 hover:bg-card2"
                }`}
              >
                <span>
                  <span className={`block text-sm font-semibold ${level === l.id ? "text-qx-violet" : "text-ink"}`}>{l.label}</span>
                  <span className="block text-xs text-ink-3">{l.hint}</span>
                </span>
                <span className={`h-4 w-4 rounded-full border-2 ${level === l.id ? "border-qx-violet bg-qx-violet" : "border-slate-600"}`} />
              </button>
            ))}
          </div>
        </Field>
        <Button type="submit" className="w-full" size="lg">Create Free Account</Button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-ink-3">
        <div className="h-px flex-1 bg-card2" /> or <div className="h-px flex-1 bg-card2" />
      </div>
      <Button variant="secondary" onClick={demo} className="w-full">
        <Compass className="h-4 w-4 text-accent" /> Explore the demo instead
      </Button>
    </AuthShell>
  );
}