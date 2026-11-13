"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CloseIcon, SmileIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, type Role } from "@/lib/navigation";

type SidebarProps = {
  role: Role;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ role, collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
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
        <SidebarContent collapsed={collapsed} items={items} pathname={pathname} />
      </aside>

      {/* Mobile off-canvas drawer */}
      <div
        className={cn("fixed inset-0 z-50 md:hidden", !mobileOpen && "pointer-events-none")}
        inert={!mobileOpen}
      >
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
          className={cn(
            "absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-900",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent
            collapsed={false}
            items={items}
            pathname={pathname}
            onNavigate={onCloseMobile}
            onClose={onCloseMobile}
          />
        </aside>
      </div>
    </>
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  items: typeof NAV_ITEMS;
  pathname: string;
  onNavigate?: () => void;
  onClose?: () => void;
};

function SidebarContent({ collapsed, items, pathname, onNavigate, onClose }: SidebarContentProps) {
  return (
    <>
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-slate-200/80 dark:border-slate-800",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
          aria-label="The Ark home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <SmileIcon className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">The Ark</span>
              <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 sm:px-3" aria-label="Primary">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Menu
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
                "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
              )}
            >
              <ItemIcon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-slate-200/80 dark:border-slate-800",
          collapsed ? "p-2" : "p-3",
        )}
      >
        {collapsed ? (
          <div className="flex justify-center py-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              AM
            </span>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-xs font-semibold">Grace Community</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Sunday · 9:00 AM service
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Kiosk online
            </div>
          </div>
        )}
      </div>
    </>
  );
}
