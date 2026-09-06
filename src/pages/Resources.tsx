import React, { useMemo, useState } from "react";
import { ArrowUpRight, Book, BookOpen, ExternalLink, FileText, GraduationCap, Video } from "lucide-react";
import { Badge, Card, EmptyState, SectionHeading } from "../components/ui";
import { RESOURCES } from "../data/content";
import { useStore } from "../lib/store";
import type { ResourceItem } from "../types";

const CATEGORIES = ["All", "Beginner", "Mathematics", "Physics", "Programming", "Algorithms", "Research", "Career"] as const;
const TYPES = ["All", "Article", "Video", "Docs", "Book", "Course"] as const;

const TYPE_ICON: Record<string, React.ReactNode> = {
  Article: <FileText className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  Docs: <BookOpen className="h-4 w-4" />,
  Book: <Book className="h-4 w-4" />,
  Course: <GraduationCap className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  Article: "text-qx-cyan bg-qx-cyan/10 border-qx-cyan/30",
  Video: "text-qx-rose bg-qx-rose/10 border-qx-rose/30",
  Docs: "text-qx-violet bg-qx-violet/10 border-qx-violet/30",
  Book: "text-qx-amber bg-qx-amber/10 border-qx-amber/30",
  Course: "text-qx-mint bg-qx-mint/10 border-qx-mint/30",
};

export default function Resources() {
  const { db } = useStore();
  const [category, setCategory] = useState<string>("All");
  const [type, setType] = useState<string>("All");

  const custom = db.resources ?? [];
  const all: ResourceItem[] = useMemo(() => [...custom, ...RESOURCES], [custom]);

  const filtered = all.filter(
    (r) => (category === "All" || r.category === category) && (type === "All" || r.type === type)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Resource Library"
        title="Go Deeper on Your Own"
        sub="Curated articles, videos, docs, books, and courses — organized by where you are on your journey."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              category === c ? "border-qx-violet/60 bg-qx-violet/20 text-qx-violet" : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/10"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-white/10" />
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              type === t ? "border-qx-cyan/60 bg-qx-cyan/15 text-qx-cyan" : "border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No resources match those filters"
          body="Try a different category or type."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-white/10 bg-ink-850/80 p-5 transition hover:border-qx-violet/40 hover:shadow-glow"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${TYPE_COLORS[r.type]}`}>
                  {TYPE_ICON[r.type]}
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-qx-cyan" />
              </div>
              <h3 className="mt-3 font-semibold leading-snug text-white group-hover:text-qx-cyan">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{r.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <Badge color="slate">{r.type}</Badge>
                <Badge color="violet">{r.category}</Badge>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-600" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}