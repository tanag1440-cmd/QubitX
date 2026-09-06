import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Atom, LogOut, Menu, X } from "lucide-react";
import { useStore } from "../../lib/store";
import { Avatar } from "./Avatar";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/learn", label: "Learn" },
  { to: "/lab", label: "Quantum Lab" },
  { to: "/visualize", label: "Visualize" },
  { to: "/algorithms", label: "Algorithms" },
  { to: "/tutor", label: "AI Tutor" },
  { to: "/challenges", label: "Challenges" },
  { to: "/resources", label: "Resources" },
];

const USER_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/progress", label: "Progress" },
  { to: "/achievements", label: "Achievements" },
  { to: "/profile", label: "Profile" },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-qx-violet to-qx-cyan shadow-glow">
        <Atom className="h-5 w-5 text-white" />
      </span>
      <span className="text-lg font-bold tracking-tight text-white">
        Qubit<span className="text-qx-cyan">X</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const { currentUser, logout, totalXp } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = currentUser ? [...PUBLIC_LINKS.filter((l) => l.to !== "/"), ...USER_LINKS] : PUBLIC_LINKS;

  const doLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <>
              <span className="rounded-lg border border-qx-amber/30 bg-qx-amber/10 px-2.5 py-1 font-mono text-xs font-bold text-qx-amber">
                {totalXp} XP
              </span>
              {currentUser.isAdmin && (
                <NavLink to="/admin" className={linkClass}>Admin</NavLink>
              )}
              <Link to="/profile" title={currentUser.name}>
                <Avatar name={currentUser.name} color={currentUser.avatarColor} size={34} />
              </Link>
              <button onClick={doLogout} title="Log out" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-qx-violet to-qx-indigo px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-ink-900 px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3">
            {currentUser ? (
              <>
                <Avatar name={currentUser.name} color={currentUser.avatarColor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{totalXp} XP</p>
                </div>
                <button onClick={doLogout} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white">
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}