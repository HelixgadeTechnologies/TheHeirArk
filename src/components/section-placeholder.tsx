import type { ComponentType } from "react";

import { SparklesIcon, type IconProps } from "@/components/icons";
import { cn } from "@/lib/cn";

type Accent = "indigo" | "emerald" | "violet" | "amber" | "rose";

const accentStyles: Record<Accent, string> = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
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
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            accentStyles[accent],
          )}
        >
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((highlight, index) => (
          <div
            key={highlight}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Step {index + 1}
            </span>
            <p className="mt-2 text-sm font-medium leading-6">{highlight}</p>
          </div>
        ))}
      </div>

      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <SparklesIcon className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold">This module is ready to build</p>
        <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          The layout, responsive navigation, and role-based access are wired up. Add your data
          model and views here next.
        </p>
      </div>
    </div>
  );
}
