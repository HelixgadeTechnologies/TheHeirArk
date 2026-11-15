"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  GridIcon,
  ListIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from "@/components/icons";
import { PaginationFooter } from "@/components/pagination";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/navigation";
import {
  addMinistryUser,
  updateUserRole,
  useUsers,
  type MinistryUser,
  type UserStatus,
} from "@/lib/users-store";

const PAGE_SIZE = 10;

const ROLE_META: Record<
  Role,
  {
    label: string;
    description: string;
    badge: string;
    border: string;
  }
> = {
  Admin: {
    label: "Administrator",
    description: "Full ministry access including Finance, System Settings & Staff Roles",
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-500/30",
  },
  Leader: {
    label: "Ministry Leader",
    description: "Coordination access: Attendance Kiosk, Children, Families & Classes",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  Teacher: {
    label: "Class Teacher",
    description: "Classroom access: Attendance Kiosk, Children roster & Class management",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-500/30",
  },
};

const STATUS_META: Record<UserStatus, { label: string; dot: string; badge: string }> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  invited: {
    label: "Pending Invite",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  suspended: {
    label: "Deactivated",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

export function SettingsManagement() {
  const { user: currentUser, role: currentRole, setRole } = useAuth();
  const users = useUsers();

  const [activeTab, setActiveTab] = useState<"users" | "general" | "security">("users");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Notifications
  const [editRoleUser, setEditRoleUser] = useState<MinistryUser | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  // Auto-dismiss feedback after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  // Reset page when search or role filter changes
  const [prevQuery, setPrevQuery] = useState(query);
  const [prevRoleFilter, setPrevRoleFilter] = useState(roleFilter);
  if (query !== prevQuery || roleFilter !== prevRoleFilter) {
    setPrevQuery(query);
    setPrevRoleFilter(roleFilter);
    setCurrentPage(1);
  }

  const search = query.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!search) return true;

      const searchTerms = [
        u.name,
        u.email,
        u.department,
        u.title,
        u.assignedClass ?? "",
        u.phone ?? "",
        u.role,
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.includes(search);
    });
  }, [users, roleFilter, search]);

  const counts = useMemo(() => {
    let admins = 0;
    let leaders = 0;
    let teachers = 0;
    let active = 0;

    for (const u of users) {
      if (u.role === "Admin") admins += 1;
      else if (u.role === "Leader") leaders += 1;
      else if (u.role === "Teacher") teachers += 1;

      if (u.status === "active") active += 1;
    }

    return { total: users.length, admins, leaders, teachers, active };
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, safePage]);

  const startEntry = filteredUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(safePage * PAGE_SIZE, filteredUsers.length);

  function handleSaveRole(user: MinistryUser, newRole: Role) {
    if (user.role === newRole) {
      setEditRoleUser(null);
      return;
    }

    const res = updateUserRole(user.id, newRole);
    if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Failed to update role." });
      return;
    }

    setFeedback({
      type: "success",
      message: `Updated ${user.name}'s role to ${newRole}. Permissions updated immediately.`,
    });
    setEditRoleUser(null);
  }

  // Access guard for non-Admin
  if (currentRole !== "Admin") {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangleIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Administrator Access Required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The Settings & User Directory console is restricted to church administrators. You are
            currently signed in as{" "}
            <strong className="font-semibold text-slate-900 dark:text-slate-200">
              {currentUser?.name || "User"} ({currentRole})
            </strong>
            .
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setRole("Admin")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
            >
              <UserCheckIcon className="h-4 w-4" />
              Switch to Administrator role
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <SettingsIcon className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                Settings & Staff Roles
              </h1>
            </div>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Manage ministry staff accounts, reassign access roles, oversee classroom authorizations,
              and enforce safety credentials.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              Administrator controls active
            </span>
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 active:scale-[0.99] sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Add or invite user
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:px-4",
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200",
            )}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium sm:text-sm">
              {feedback.type === "success" ? (
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangleIcon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total staff</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-indigo-700 sm:text-3xl dark:text-indigo-400">
              {counts.total}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registered accounts</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Administrators
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl dark:text-slate-100">
              {counts.admins}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Full control access</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Ministry Leaders
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700 sm:text-3xl dark:text-emerald-400">
              {counts.leaders}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Coordinators & Leads</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Class Teachers
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-amber-700 sm:text-3xl dark:text-amber-400">
              {counts.teachers}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sunday educators</p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              activeTab === "users"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            <UserCheckIcon className="h-4 w-4" />
            <span>Staff Users & Roles</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {users.length}
            </span>
          </button>

          <Link
            href="/settings/teacher-attendance"
            className="-mb-px flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-indigo-600"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Staff Attendance</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
              Teachers &amp; Leaders
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            <span>Ministry Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              activeTab === "security"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Security & Safeguards</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "users" && (
        <section
          aria-labelledby="users-directory-heading"
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/90"
        >
          <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  id="users-directory-heading"
                  className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  All Staff Accounts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                    {startEntry}–{endEntry}
                  </span>{" "}
                  of{" "}
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    {filteredUsers.length}
                  </span>{" "}
                  {filteredUsers.length === 1 ? "user" : "users"}
                  {roleFilter !== "all" && (
                    <>
                      {" "}
                      · filtered by{" "}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {ROLE_META[roleFilter].label}
                      </span>
                    </>
                  )}
                  {totalPages > 1 && (
                    <>
                      {" "}
                      · Page{" "}
                      <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                        {safePage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                        {totalPages}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* View Mode Toggle: Cards / List */}
              <div
                role="group"
                aria-label="View layout"
                className="inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700/80 dark:bg-slate-800/80"
              >
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  aria-pressed={viewMode === "cards"}
                  aria-label="Cards view"
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500",
                    viewMode === "cards"
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  )}
                >
                  <GridIcon className="h-4 w-4" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500",
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  )}
                >
                  <ListIcon className="h-4 w-4" />
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <label htmlFor="user-search" className="sr-only">
                  Search users by name, email or department
                </label>
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="user-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by staff name, email, department or title…"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Role Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Role:
                </span>
                {(
                  [
                    { id: "all", label: "All Roles", count: users.length },
                    { id: "Admin", label: "Administrators", count: counts.admins },
                    { id: "Leader", label: "Leaders", count: counts.leaders },
                    { id: "Teacher", label: "Teachers", count: counts.teachers },
                  ] as const
                ).map((chip) => {
                  const active = roleFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setRoleFilter(chip.id)}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
                      )}
                    >
                      <span>{chip.label}</span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.2 text-[10px] tabular-nums",
                          active
                            ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
                        )}
                      >
                        {chip.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User List or Empty State */}
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <SearchIcon className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                No matching staff accounts
              </p>
              <p className="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                Try searching by another name, email address, or clear your active role filter.
              </p>
              {(query || roleFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setRoleFilter("all");
                  }}
                  className="mt-3 h-10 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
              {paginatedUsers.map((user) => {
                const roleMeta = ROLE_META[user.role];
                const statusMeta = STATUS_META[user.status];
                const isCurrentSelf = currentUser?.id === user.id;

                return (
                  <article
                    key={user.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-xs text-indigo-700 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {user.avatarInitials}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                              {user.name}
                            </h3>
                            {isCurrentSelf && (
                              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                You
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          roleMeta.badge,
                        )}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Title:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Department:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.department}
                        </span>
                      </div>
                      {user.assignedClass && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Class:</span>
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                            {user.assignedClass}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 dark:text-slate-400">Status:</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} />
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditRoleUser(user)}
                        className="inline-flex h-9 w-full touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                      >
                        <UserCheckIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Change Role</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      User Profile
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Current Role
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Title & Department
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Assigned Class
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedUsers.map((user) => {
                    const roleMeta = ROLE_META[user.role];
                    const statusMeta = STATUS_META[user.status];
                    const isCurrentSelf = currentUser?.id === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-xs text-indigo-700 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300">
                              {user.avatarInitials}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {user.name}
                                </p>
                                {isCurrentSelf && (
                                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              roleMeta.badge,
                            )}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {user.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {user.department}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                          {user.assignedClass ? (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {user.assignedClass}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} />
                            {statusMeta.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setEditRoleUser(user)}
                            className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                          >
                            <UserCheckIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Change Role</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredUsers.length > 0 && (
            <PaginationFooter
              startEntry={startEntry}
              endEntry={endEntry}
              totalEntries={filteredUsers.length}
              singularLabel="user"
              pluralLabel="users"
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              ariaLabel="Staff users pagination"
            />
          )}
        </section>
      )}

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Ministry Identification
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Basic church campus details and service coordination schedule.
            </p>

            <dl className="mt-4 divide-y divide-slate-100 text-xs dark:divide-slate-800">
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Church Campus</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  Grace Community Church
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Children&apos;s Ministry</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  The Ark (Ages 1–17)
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Main Service Schedule</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">Sunday · 9:00 AM</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Active Timezone</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  UTC+01:00 (West Africa)
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Check-in & Kiosk Policy
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Safety parameters enforced at the self-service and volunteer kiosks.
            </p>

            <dl className="mt-4 divide-y divide-slate-100 text-xs dark:divide-slate-800">
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Check-in Open Window</dt>
                <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                  45 minutes before service
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Pick-up Verification</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  Authorized Guardian Match Required
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Security Restriction Enforcement</dt>
                <dd className="font-semibold text-rose-700 dark:text-rose-400">
                  Hard Kiosk Block (Strict)
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Medical & Allergy Flags</dt>
                <dd className="font-semibold text-amber-700 dark:text-amber-400">
                  Prominent Badge on All Rosters
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Role-Based Access Control (RBAC)
                </h3>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Each role provides strictly isolated capabilities across the application:
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheckIcon className="h-4 w-4" />
                Enforced
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["Admin", "Leader", "Teacher"] as const).map((r) => {
                const meta = ROLE_META[r];
                return (
                  <div
                    key={r}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <span
                      className={cn(
                        "w-fit rounded-full px-2 py-0.5 text-[11px] font-bold",
                        meta.badge,
                      )}
                    >
                      {r}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{meta.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Dialog Modal */}
      {editRoleUser && (
        <EditRoleDialog
          user={editRoleUser}
          onClose={() => setEditRoleUser(null)}
          onSave={(newRole) => handleSaveRole(editRoleUser, newRole)}
        />
      )}

      {/* Add / Invite User Modal */}
      {inviteModalOpen && (
        <InviteUserDialog
          onClose={() => setInviteModalOpen(false)}
          onSaved={(newUser) => {
            setFeedback({
              type: "success",
              message: `Added new user ${newUser.name} as ${newUser.role}.`,
            });
            setInviteModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Edit Role Dialog
// -------------------------------------------------------------------------------------------------
type EditRoleDialogProps = {
  user: MinistryUser;
  onClose: () => void;
  onSave: (newRole: Role) => void;
};

function EditRoleDialog({ user, onClose, onSave }: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-role-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-sm text-indigo-700 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300">
              {user.avatarInitials}
            </span>
            <div>
              <h2
                id="change-role-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Change User Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.name} · {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select new access role for this staff member:
          </p>

          <div className="space-y-2.5">
            {(["Admin", "Leader", "Teacher"] as const).map((r) => {
              const meta = ROLE_META[r];
              const isSelected = selectedRole === r;
              const isCurrent = user.role === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:border-indigo-400 dark:bg-indigo-500/10"
                      : "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400"
                        : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800",
                    )}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-900" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {meta.label}
                      </span>
                      {isCurrent && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Current role
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {meta.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Notice:</span> Role
            changes take effect immediately across all active sessions and permission gates.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selectedRole)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>Confirm Role Change</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Invite User Dialog
// -------------------------------------------------------------------------------------------------
type InviteUserDialogProps = {
  onClose: () => void;
  onSaved: (user: MinistryUser) => void;
};

function InviteUserDialog({ onClose, onSaved }: InviteUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Teacher");
  const [department, setDepartment] = useState("Sunday School Education");
  const [assignedClass, setAssignedClass] = useState("Kingdom Kids (Ages 5–7)");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = addMinistryUser({
      name,
      email,
      role,
      department,
      assignedClass: role === "Teacher" ? assignedClass : undefined,
      phone: phone || undefined,
    });

    if (!res.success || !res.user) {
      setError(res.error || "Failed to add user.");
      return;
    }

    onSaved(res.user);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-user-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2
              id="invite-user-title"
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Add Staff / Volunteer User
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a new user account with designated ministry role and authorizations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="new-user-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Full Name *
            </label>
            <input
              id="new-user-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emmanuel Osei"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="new-user-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Ministry Email Address *
            </label>
            <div className="relative mt-1">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="new-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@theark.church"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-user-role"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Access Role *
              </label>
              <select
                id="new-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Admin">Administrator</option>
                <option value="Leader">Ministry Leader</option>
                <option value="Teacher">Class Teacher</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="new-user-phone"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Phone (Optional)
              </label>
              <div className="relative mt-1">
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="new-user-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="new-user-dept"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Department
            </label>
            <input
              id="new-user-dept"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Sunday School Education"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {role === "Teacher" && (
            <div>
              <label
                htmlFor="new-user-class"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Assigned Class Cohort
              </label>
              <select
                id="new-user-class"
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Little Lights (Ages 2–4)">Little Lights (Ages 2–4)</option>
                <option value="Kingdom Kids (Ages 5–7)">Kingdom Kids (Ages 5–7)</option>
                <option value="Overcomers (Ages 8–11)">Overcomers (Ages 8–11)</option>
                <option value="Teens (Ages 12+)">Teens (Ages 12+)</option>
                <option value="Float Volunteer">Float Volunteer</option>
              </select>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create User Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
