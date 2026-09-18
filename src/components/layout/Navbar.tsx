import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Atom, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useStore } from "../../lib/store";
import { ThemeToggle } from "../../lib/theme";
import { Avatar } from "./Avatar";

const GUEST_PRIMARY = [
  { to: "/", label: "Home" },
  { to: "/learn", label: "Learn" },
  { to: "/lab", label: "Quantum Lab" },
  { to: "/tutor", label: "AI Tutor" },
  { to: "/ai-challenges", label: "AI Challenges" },
];

const USER_PRIMARY = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/learn", label: "Learn" },
  { to: "/learning-path", label: "Learning Path" },
  { to: "/lab", label: "Quantum Lab" },
  { to: "/tutor", label: "AI Tutor" },
  { to: "/ai-challenges", label: "AI Challenges" },
];

const SECONDARY = [
  { to: "/visualize", label: "Visualize" },
  { to: "/algorithms", label: "Algorithms" },
  { to: "/experiments", label: "Experiments" },
  { to: "/challenges", label: "Daily Challenges" },
  { to: "/diagnostic", label: "Diagnostic" },
  { to: "/progress", label: "Progress" },
  { to: "/achievements", label: "Achievements" },
  { to: "/profile", label: "Profile" },
  { to: "/resources", label: "Resources" },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
        <Atom className="h-5 w-5 text-white" />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">
        Qubit<span className="text-accent">X</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const { currentUser, logout, totalXp } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const primary = currentUser ? USER_PRIMARY : GUEST_PRIMARY;
  const secondary = currentUser ? SECONDARY : SECONDARY.filter((s) => !["/progress", "/achievements", "/profile"].includes(s.to));

  const doLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? "bg-card2 text-ink" : "text-ink-2 hover:text-ink hover:bg-card2"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-card2 text-ink" : "text-ink-2 hover:text-ink hover:bg-card2"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/85 ">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {primary.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                moreOpen ? "bg-card2 text-ink" : "text-ink-2 hover:bg-card2 hover:text-ink"
              }`}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
            >
              More <ChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 animate-fade-up rounded-2xl border border-line bg-card/95 p-2 shadow-card "
              >
                {secondary.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive ? "bg-card2 text-ink" : "text-ink-2 hover:bg-card2 hover:text-ink"
                      }`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    {l.label}
                  </NavLink>
                ))}
                {currentUser?.isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive ? "bg-card2 text-ink" : "text-ink-2 hover:bg-card2 hover:text-ink"
                      }`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    Admin Panel
                  </NavLink>
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {currentUser ? (
            <>
              <span className="rounded-lg border border-qx-amber/30 bg-qx-amber/10 px-2.5 py-1 font-mono text-xs font-bold text-qx-amber">
                {totalXp} XP
              </span>
              <Link to="/profile" title={currentUser.name}>
                <Avatar name={currentUser.name} color={currentUser.avatarColor} size={34} />
              </Link>
              <button onClick={doLogout} title="Log out" className="rounded-lg p-2 text-ink-2 hover:bg-card2 hover:text-ink">
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button className="rounded-lg p-2 text-ink-2 hover:bg-card2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-card2 px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {primary.map((l) => (
              <NavLink key={l.to} to={l.to} className={mobileLinkClass} onClick={() => setOpen(false)} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
            <p className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">More</p>
            {secondary.map((l) => (
              <NavLink key={l.to} to={l.to} className={mobileLinkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {currentUser?.isAdmin && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setOpen(false)}>
                Admin Panel
              </NavLink>
            )}
          </nav>
          <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
            {currentUser ? (
              <>
                <Avatar name={currentUser.name} color={currentUser.avatarColor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{currentUser.name}</p>
                  <p className="text-xs text-ink-3">{totalXp} XP</p>
                </div>
                <button onClick={doLogout} className="rounded-lg p-2 text-ink-2 hover:bg-card2">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex-1 rounded-xl border border-line bg-card2 px-4 py-2 text-center text-sm font-medium text-ink">
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
