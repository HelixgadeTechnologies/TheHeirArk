"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CloseIcon, LogOutIcon, SmileIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/auth-context";
import { NAV_ITEMS, type NavItem, type Role } from "@/lib/navigation";

type SidebarProps = {
  role: Role;
  user?: User | null;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
};

export function Sidebar({ role, user, collapsed, mobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Desktop / tablet persistent sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-300 ease-out md:flex dark:border-slate-800 dark:bg-slate-900",
          collapsed ? "md:w-[76px]" : "md:w-64",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          items={items}
          pathname={pathname}
          user={user}
          role={role}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Mobile drawer */}
      <aside
        aria-label="Mobile Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden dark:border-slate-800 dark:bg-slate-900",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          collapsed={false}
          items={items}
          pathname={pathname}
          onClose={onCloseMobile}
          onNavigate={onCloseMobile}
          user={user}
          role={role}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  items: readonly NavItem[];
  pathname: string;
  onClose?: () => void;
  onNavigate?: () => void;
  user?: User | null;
  role: Role;
  onLogout?: () => void;
};

const roleBadgeTone: Record<Role, string> = {
  Admin: "bg-indigo-50 text-indigo-700 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
  Leader: "bg-emerald-50 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  Teacher: "bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
};

function SidebarContent({
  collapsed,
  items,
  pathname,
  onClose,
  onNavigate,
  user,
  role,
  onLogout,
}: SidebarContentProps) {
  return (
    <>
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-slate-200/80 dark:border-slate-800",
          collapsed ? "justify-center px-2" : "justify-between px-4 sm:px-5",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
          aria-label="The Ark home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <SmileIcon className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                The Ark
              </span>
              <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                Children&apos;s Church
              </span>
            </span>
          )}
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 sm:px-3" aria-label="Primary">
        {!collapsed && (
          <p className="px-3 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Navigation
          </p>
        )}
        {items.map((item) => {
          const ItemIcon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
              )}
            >
              <ItemIcon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info & Church session status */}
      <div
        className={cn(
          "shrink-0 space-y-2 border-t border-slate-200/80 dark:border-slate-800",
          collapsed ? "p-2" : "p-3",
        )}
      >
        {user && !collapsed && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                {user.avatarInitials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user.name}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1",
                    roleBadgeTone[role],
                  )}
                >
                  {role}
                </span>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-rose-600 dark:hover:bg-slate-700 dark:hover:text-rose-400"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              title={user ? `${user.name} (${role})` : "Grace Community"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            >
              {user?.avatarInitials ?? "GC"}
            </span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Grace Community
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Sunday · 9:00 AM service
            </p>
          </div>
        )}
      </div>
    </>
  );
}
