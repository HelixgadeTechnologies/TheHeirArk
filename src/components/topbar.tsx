"use client";

import {
  BellIcon,
  ChevronDownIcon,
  MenuIcon,
  PanelLeftIcon,
  SearchIcon,
} from "@/components/icons";
import { RoleSwitcher } from "@/components/role-switcher";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/navigation";

type TopbarProps = {
  title: string;
  role: Role;
  collapsed: boolean;
  onRoleChange: (role: Role) => void;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
};

export function Topbar({
  title,
  role,
  collapsed,
  onRoleChange,
  onToggleCollapse,
  onOpenMobile,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:inline-flex dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <PanelLeftIcon className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            The Ark
          </p>
          <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <label className="relative hidden lg:flex">
            <span className="sr-only">Search children and families</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search children, families…"
              className="h-9 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900 xl:w-64"
            />
          </label>

          <RoleSwitcher role={role} onChange={onRoleChange} />

          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className="hidden h-8 w-px bg-slate-200 lg:block dark:bg-slate-700" />

          <button
            type="button"
            aria-label="Account menu"
            className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-100 sm:pr-2 dark:hover:bg-slate-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
              AM
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-xs font-semibold leading-4">Ayo Sigodfrey</span>
              <span className="block text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                {role}
              </span>
            </span>
            <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 lg:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
