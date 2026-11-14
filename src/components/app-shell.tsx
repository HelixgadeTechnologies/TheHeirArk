"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useAuth } from "@/lib/auth-context";
import { NAV_ITEMS } from "@/lib/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, isAuthenticated, setRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  const activeItem =
    NAV_ITEMS.find((item) => item.href === pathname) ??
    NAV_ITEMS.find((item) => item.href !== "/" && pathname.startsWith(item.href));

  // Prevent background scroll when mobile navigation drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Keep users out of pages their selected role cannot access.
  useEffect(() => {
    if (!isLoginPage && activeItem && !activeItem.roles.includes(role)) {
      router.replace("/");
    }
  }, [activeItem, role, router, isLoginPage]);

  // Redirect to login if unauthenticated and not already on login page
  useEffect(() => {
    if (!isLoginPage && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoginPage, router]);

  // If on login page, render full screen login UI without app chrome.
  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </main>
    );
  }

  // If not authenticated, render a matching outer shell while router redirects
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Redirecting to sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        role={role}
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={activeItem?.label ?? "Dashboard"}
          role={role}
          user={user}
          collapsed={collapsed}
          onRoleChange={setRole}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onOpenMobile={() => setMobileOpen(true)}
          onLogout={logout}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
