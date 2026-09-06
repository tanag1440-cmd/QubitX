import React from "react";
import { useNavigate } from "react-router-dom";
import { Atom } from "lucide-react";
import { Button } from "../components/ui";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="quantum-bg flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Atom className="mb-4 h-12 w-12 animate-pulse-soft text-qx-violet" />
      <p className="font-mono text-6xl font-extrabold text-white">404</p>
      <p className="mt-2 text-lg font-semibold text-slate-300">This state collapsed</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        The page you're looking for was measured and found to not exist. Try heading back to the dashboard.
      </p>
      <Button className="mt-6" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
    </div>
  );
}