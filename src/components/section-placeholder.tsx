import type { ComponentType } from "react";

import { SparklesIcon, type IconProps } from "@/components/icons";
import { cn } from "@/lib/cn";

type Accent = "indigo" | "emerald" | "violet" | "amber" | "rose";

const accentStyles: Record<Accent, string> = {
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 ring-1 ring-indigo-500/20",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 ring-1 ring-emerald-500/20",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 ring-1 ring-violet-500/20",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 ring-1 ring-amber-500/20",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 ring-1 ring-rose-500/20",
};

type SectionPlaceholderProps = {
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  highlights: readonly string[];
  accent?: Accent;
};

export function SectionPlaceholder({
  title,
  description,
  icon: Icon,
  highlights,
  accent = "indigo",
}: SectionPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800/90 dark:bg-slate-900/90">
        <span
          className={cn(
            "flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl",
            accentStyles[accent],
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 transition-colors dark:border-slate-800/90 dark:bg-slate-900/90"
          >
            <div className="flex h-2 w-2 rounded-full bg-indigo-500" />
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200">{highlight}</p>
          </div>
        ))}
      </div>

      <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <SparklesIcon className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Household & Family Directory Coming Soon</p>
        <p className="max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
          Manage family relationships, multi-child pick-up authorizations, emergency contacts, and household announcements.
        </p>
      </div>
    </div>
  );
}
