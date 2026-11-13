"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  PanelLeftIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { RoleSwitcher } from "@/components/role-switcher";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/auth-context";
import { ROLES, type Role } from "@/lib/navigation";

type TopbarProps = {
  title: string;
  role: Role;
  user?: User | null;
  collapsed: boolean;
  onRoleChange: (role: Role) => void;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onLogout?: () => void;
};

const roleBadgeTone: Record<Role, string> = {
  Admin: "bg-indigo-50 text-indigo-700 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
  Leader: "bg-emerald-50 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  Teacher: "bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
};

export function Topbar({
  title,
  role,
  user,
  collapsed,
  onRoleChange,
  onToggleCollapse,
  onOpenMobile,
  onLogout,
}: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/children?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen]);

  const displayName = user?.name ?? "Ministry User";
  const displayEmail = user?.email ?? "user@theark.church";
  const initials = user?.avatarInitials ?? "MU";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/90">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        {/* Mobile menu button with 44x44px touch target */}
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 md:inline-flex dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <PanelLeftIcon
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              collapsed && "rotate-180",
            )}
          />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
            {title}
          </h1>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Functional search form */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:flex">
            <label htmlFor="topbar-search" className="sr-only">
              Search children, families, or classes
            </label>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="topbar-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search children, families…"
              className="h-10 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900 xl:w-64"
            />
          </form>

          <RoleSwitcher role={role} onChange={onRoleChange} />

          {/* Notification button with 44px touch target */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 sm:h-10 sm:w-10 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className="hidden h-7 w-px bg-slate-200 lg:block dark:bg-slate-700" />

          {/* Account profile menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="flex min-h-[44px] items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 sm:min-h-0 sm:pr-2.5 dark:hover:bg-slate-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
                {initials}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-xs font-semibold leading-4 text-slate-900 dark:text-slate-100">
                  {displayName}
                </span>
                <span className="block text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  {role}
                </span>
              </span>
              <ChevronDownIcon
                className={cn(
                  "hidden h-4 w-4 text-slate-400 transition-transform duration-200 lg:block",
                  menuOpen && "rotate-180",
                )}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900"
              >
                {/* User card header */}
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                      {initials}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                        roleBadgeTone[role],
                      )}
                    >
                      {role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {displayEmail}
                  </p>
                  {user?.title && (
                    <p className="mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {user.title}
                    </p>
                  )}
                  {user?.assignedClass && (
                    <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                      Class: {user.assignedClass}
                    </p>
                  )}
                </div>

                {/* Quick switch role section */}
                <div className="p-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Switch Workspace Role
                  </p>
                  <div className="mt-1.5 grid grid-cols-3 gap-1">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          onRoleChange(r);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          "h-8 rounded-lg text-xs font-semibold transition-colors",
                          role === r
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <div className="p-1">
                  <p className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                    Audited church session
                  </p>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="flex h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Sign out of The Ark
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
