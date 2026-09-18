import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Compass } from "lucide-react";
import { AuthShell, Field, inputClass } from "../components/auth/AuthShell";
import { Button } from "../components/ui";
import { useStore } from "../lib/store";

export default function Login() {
  const { login, enterDemo } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(email, password);
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
      title="Welcome back"
      sub="Log in to continue your quantum journey."
      footer={
        <>
          New to QubitX?{" "}
          <Link to="/signup" className="font-semibold text-accent hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-ink-2 hover:text-accent">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg">Log in</Button>
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