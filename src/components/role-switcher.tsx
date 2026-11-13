"use client";

import { cn } from "@/lib/cn";
import { ROLES, type Role } from "@/lib/navigation";

const activeTone: Record<Role, string> = {
  Admin: "bg-indigo-600 text-white shadow-xs",
  Leader: "bg-emerald-600 text-white shadow-xs",
  Teacher: "bg-amber-600 text-white shadow-xs",
};

type RoleSwitcherProps = {
  role: Role;
  onChange: (role: Role) => void;
};

export function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  return (
    <>
      {/* Mobile: accessible 44px touch target native select */}
      <label className="sm:hidden">
        <span className="sr-only">Switch role</span>
        <select
          value={role}
          onChange={(event) => onChange(event.target.value as Role)}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {/* Tablet / desktop: segmented control */}
      <div
        role="group"
        aria-label="Switch role"
        className="hidden h-9 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 sm:flex dark:border-slate-700/80 dark:bg-slate-800/80"
      >
        {ROLES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={role === option}
            className={cn(
              "h-7 rounded-lg px-2.5 text-xs font-semibold transition-all duration-150 lg:px-3 focus-visible:ring-2 focus-visible:ring-indigo-500",
              role === option
                ? activeTone[option]
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
}
