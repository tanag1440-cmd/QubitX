import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthShell, Field, inputClass } from "../components/auth/AuthShell";
import { Button, Card } from "../components/ui";
import { useStore } from "../lib/store";

export default function ForgotPassword() {
  const { resetPassword } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const known = resetPassword(email);
    setSent(true);
    setError(known ? null : "We couldn't find that account — but in this prototype no reset email is sent anyway.");
  };

  return (
    <AuthShell
      title="Reset your password"
      sub="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-qx-cyan hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      }
    >
      {sent ? (
        <Card className="border-qx-mint/30 bg-qx-mint/10 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-qx-mint/20">
            <MailCheck className="h-6 w-6 text-qx-mint" />
          </div>
          <h3 className="font-semibold text-white">Reset link sent</h3>
          <p className="mt-2 text-sm text-slate-400">
            {error ?? `If an account exists for ${email}, a reset link would be sent here. (Prototype: no email is actually delivered.)`}
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-qx-cyan hover:underline">
            Return to login
          </Link>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">{error}</p>}
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
          <Button type="submit" className="w-full" size="lg">Send reset link</Button>
          <p className="text-center text-xs text-slate-500">
            For this SIH prototype, password reset is simulated — no emails are sent.
          </p>
        </form>
      )}
    </AuthShell>
  );
}