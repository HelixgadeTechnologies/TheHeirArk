"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CloseIcon,
  GridIcon,
  ListIcon,
  LogOutIcon,
  SearchIcon,
  UserCheckIcon,
} from "@/components/icons";
import { PaginationFooter } from "@/components/pagination";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/navigation";
import {
  batchSignInTeachers,
  signInTeacher,
  signOutTeacher,
  useTeacherAttendance,
  type ServiceRole,
  type TeacherAttendanceRecord,
  type TeacherAttendanceStatus,
} from "@/lib/teacher-attendance-store";

const PAGE_SIZE = 10;

const STATUS_META: Record<
  TeacherAttendanceStatus,
  { label: string; dot: string; badge: string }
> = {
  "signed-in": {
    label: "On Duty",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20",
  },
  expected: {
    label: "Expected",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/20",
  },
  "signed-out": {
    label: "Signed Out",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-800 ring-1 ring-violet-600/20",
  },
};

const ROLE_META: Record<
  Role,
  { label: string; badge: string; dot: string }
> = {
  Admin: {
    label: "Admin",
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20",
    dot: "bg-indigo-500",
  },
  Leader: {
    label: "Leader",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  Teacher: {
    label: "Teacher",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    dot: "bg-amber-500",
  },
};

const SERVICE_ROLES: ServiceRole[] = [
  "Ministry Director",
  "Ministry Coordinator",
  "Safety & Security",
  "Check-in Lead",
  "Lead Teacher",
  "Assistant Teacher",
  "Substitute Teacher",
  "Classroom Floater",
  "Special Needs Support",
];

const ROOM_OPTIONS = [
  { id: "all", label: "All Rooms & Locations" },
  { id: "Room 101", label: "Room 101 · Little Lights (0–4)" },
  { id: "Room 102", label: "Room 102 · Kingdom Kids (5–8)" },
  { id: "Room 201", label: "Room 201 · Overcomers (9–12)" },
  { id: "Auditorium", label: "Auditorium · Worship Hall" },
  { id: "Main Foyer", label: "Main Foyer · Kiosks & Care" },
  { id: "Directorate Office", label: "Directorate Office · Administration" },
  { id: "Resource Center", label: "Resource Center · Curriculum" },
  { id: "Facilities & Grounds", label: "Facilities & Grounds · Operations" },
  { id: "Lower Hall", label: "Lower Hall · Teens Ministry" },
];

export function TeacherAttendanceManagement() {
  const { user: currentUser } = useAuth();
  const staffRecords = useTeacherAttendance();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TeacherAttendanceStatus | "all">("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Feedback
  const [signInTeacherRecord, setSignInTeacherRecord] = useState<TeacherAttendanceRecord | null>(null);
  const [signOutTeacherRecord, setSignOutTeacherRecord] = useState<TeacherAttendanceRecord | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-dismiss feedback after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Reset page on filter change
  const [prevQuery, setPrevQuery] = useState(query);
  const [prevRole, setPrevRole] = useState(roleFilter);
  const [prevStatus, setPrevStatus] = useState(statusFilter);
  const [prevRoom, setPrevRoom] = useState(roomFilter);
  if (
    query !== prevQuery ||
    roleFilter !== prevRole ||
    statusFilter !== prevStatus ||
    roomFilter !== prevRoom
  ) {
    setPrevQuery(query);
    setPrevRole(roleFilter);
    setPrevStatus(statusFilter);
    setPrevRoom(roomFilter);
    setCurrentPage(1);
  }

  // Counts & Role Breakdown
  const counts = useMemo(() => {
    let present = 0;
    let expected = 0;
    let signedOut = 0;
    let admins = 0;
    let leaders = 0;
    let teachers = 0;

    for (const r of staffRecords) {
      if (r.status === "signed-in") present += 1;
      else if (r.status === "expected") expected += 1;
      else if (r.status === "signed-out") signedOut += 1;

      if (r.ministryRole === "Admin") admins += 1;
      else if (r.ministryRole === "Leader") leaders += 1;
      else if (r.ministryRole === "Teacher") teachers += 1;
    }
    return {
      present,
      expected,
      signedOut,
      admins,
      leaders,
      teachers,
      total: staffRecords.length,
    };
  }, [staffRecords]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staffRecords.filter((r) => {
      if (roleFilter !== "all" && r.ministryRole !== roleFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        roomFilter !== "all" &&
        !r.roomNumber.toLowerCase().includes(roomFilter.toLowerCase())
      ) {
        return false;
      }
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone ?? "").toLowerCase().includes(q) ||
        r.assignedClass.toLowerCase().includes(q) ||
        r.serviceRole.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.ministryRole.toLowerCase().includes(q)
      );
    });
  }, [staffRecords, roleFilter, statusFilter, roomFilter, query]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const startEntry = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(safePage * PAGE_SIZE, filtered.length);

  // Quick One-Click Sign In
  function handleQuickSignIn(record: TeacherAttendanceRecord) {
    const adminName = currentUser ? `${currentUser.name} (Admin)` : "Grace Okafor (Admin)";
    const res = signInTeacher(record.id, { adminName });
    if (res.success) {
      setFeedback({
        type: "success",
        message: `${record.name} (${record.ministryRole}) signed in successfully for ${record.assignedClass}.`,
      });
    }
  }

  // Batch Sign In Expected Staff
  function handleBatchSignIn() {
    const expectedIds = staffRecords.filter((r) => r.status === "expected").map((r) => r.id);
    if (expectedIds.length === 0) {
      setFeedback({
        type: "error",
        message: "All scheduled staff and teachers are already signed in or have completed their shifts.",
      });
      return;
    }

    const adminName = currentUser ? `${currentUser.name} (Admin)` : "Grace Okafor (Admin)";
    const { count } = batchSignInTeachers(expectedIds, adminName);
    setFeedback({
      type: "success",
      message: `Batch signed in ${count} expected staff member${count > 1 ? "s" : ""} on duty.`,
    });
  }

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const singularLabel =
    roleFilter === "Teacher"
      ? "teacher"
      : roleFilter === "Leader"
        ? "leader"
        : roleFilter === "Admin"
          ? "admin"
          : "staff member";

  const pluralLabel =
    roleFilter === "Teacher"
      ? "teachers"
      : roleFilter === "Leader"
        ? "leaders"
        : roleFilter === "Admin"
          ? "admins"
          : "staff members";

  return (
    <div className="space-y-6">
      {/* Top Header & Context Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/settings" className="text-indigo-600 hover:text-indigo-700">
              Settings &amp; Administration
            </Link>
            <span>/</span>
            <span className="text-slate-800">Staff Attendance Kiosk</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Staff, Leader &amp; Teacher Attendance
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Record arrival times for all ministry personnel—including Teachers, Ministry Leaders, and
            Church Administrators—verify room assignments, track service roles, and log shifts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/attendance"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <span>👦 Children Kiosk</span>
          </Link>
          <button
            type="button"
            onClick={handleBatchSignIn}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-[0.99]"
          >
            <UserCheckIcon className="h-4 w-4" />
            <span>Sign in all expected ({counts.expected})</span>
          </button>
        </div>
      </div>

      {/* Live Feedback Toast */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-xs sm:px-4",
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900",
          )}
        >
          <div className="flex items-center gap-2.5 text-xs font-medium sm:text-sm">
            {feedback.type === "success" ? (
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangleIcon className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss message"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Attendance Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Present on Duty */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Present on Duty</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700 sm:text-3xl">
            {counts.present}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {counts.total > 0
              ? `${Math.round((counts.present / counts.total) * 100)}% of roster present`
              : "No staff scheduled"}
          </p>
        </div>

        {/* Expected Arrival */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Expected Arrival</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-amber-700 sm:text-3xl">
            {counts.expected}
          </p>
          <p className="mt-1 text-xs text-slate-500">Pending arrival sign-in</p>
        </div>

        {/* Completed Shifts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Completed Shifts</span>
            <span className="h-2 w-2 rounded-full bg-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-violet-700 sm:text-3xl">
            {counts.signedOut}
          </p>
          <p className="mt-1 text-xs text-slate-500">Signed out &amp; finished</p>
        </div>

        {/* Total Roster */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Roster</span>
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-indigo-700 sm:text-3xl">
            {counts.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {counts.teachers} Teachers · {counts.leaders} Leaders · {counts.admins} Admins
          </p>
        </div>
      </div>

      {/* Main Section */}
      <section
        aria-label="Staff and Teacher Attendance Roster"
        className="rounded-2xl border border-slate-200 bg-white shadow-2xs"
      >
        {/* Controls Bar */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Staff Roster · {todayFormatted}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Live attendance for Teachers, Ministry Leaders, and Church Admins.
              </p>
            </div>

            {/* Layout Toggle */}
            <div
              role="group"
              aria-label="View layout"
              className="inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5"
            >
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all",
                  viewMode === "cards"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <GridIcon className="h-4 w-4" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all",
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <ListIcon className="h-4 w-4" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Search, Role Filters, Room Filters & Status Pills */}
          <div className="mt-4 flex flex-col gap-3">
            {/* Top row: Search input + Room dropdown */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, role (Admin/Leader/Teacher), classroom, or phone..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Room / Location Filter */}
              <div className="relative shrink-0">
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {ROOM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Bottom row: Role Tabs + Status Pills */}
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
                  Role:
                </span>
                <button
                  type="button"
                  onClick={() => setRoleFilter("all")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                    roleFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span>All Staff</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.total}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("Teacher")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                    roleFilter === "Teacher"
                      ? "bg-amber-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Teachers</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.teachers}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("Leader")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                    roleFilter === "Leader"
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Leaders</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.leaders}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("Admin")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                    roleFilter === "Admin"
                      ? "bg-indigo-700 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>Admins</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.admins}
                  </span>
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
                  Status:
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors",
                    statusFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span>All</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.total}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("signed-in")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors",
                    statusFilter === "signed-in"
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span>On Duty</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.present}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("expected")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors",
                    statusFilter === "expected"
                      ? "bg-amber-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span>Expected</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.expected}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("signed-out")}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors",
                    statusFilter === "signed-out"
                      ? "bg-violet-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span>Signed Out</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {counts.signedOut}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content View */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <SearchIcon className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-slate-900">No staff members found</p>
            <p className="max-w-sm text-xs leading-5 text-slate-500">
              Try adjusting your role filter, classroom/room location, or search keyword.
            </p>
            {(query || roleFilter !== "all" || statusFilter !== "all" || roomFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setRoomFilter("all");
                }}
                className="mt-3 h-9 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid gap-3.5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {paginated.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                record={teacher}
                onQuickSignIn={() => handleQuickSignIn(teacher)}
                onOpenSignInModal={() => setSignInTeacherRecord(teacher)}
                onOpenSignOutModal={() => setSignOutTeacherRecord(teacher)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Staff Member
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Room / Assignment
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Service Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Arrival
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-700">
                    Departure
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((teacher) => {
                  const meta = STATUS_META[teacher.status];
                  const roleMeta = ROLE_META[teacher.ministryRole];
                  return (
                    <tr key={teacher.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-indigo-500/15">
                            {teacher.avatarInitials}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{teacher.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {teacher.phone || teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            roleMeta.badge,
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", roleMeta.dot)} />
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            meta.badge,
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <p className="text-xs font-semibold text-slate-800">
                          {teacher.roomNumber}
                        </p>
                        <p className="text-[11px] text-slate-500">{teacher.assignedClass}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {teacher.serviceRole}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                        {teacher.signedInAt ? (
                          <div>
                            <span className="font-semibold tabular-nums text-slate-900">
                              {teacher.signedInAt}
                            </span>
                            {teacher.signedInBy && (
                              <p className="text-[10px] text-slate-400">by {teacher.signedInBy}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Not signed in</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                        {teacher.signedOutAt ? (
                          <div>
                            <span className="font-semibold tabular-nums text-slate-900">
                              {teacher.signedOutAt}
                            </span>
                            {teacher.signedOutBy && (
                              <p className="text-[10px] text-slate-400">by {teacher.signedOutBy}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        {teacher.status === "expected" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickSignIn(teacher)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-500"
                            >
                              Sign In
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignInTeacherRecord(teacher)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Options
                            </button>
                          </div>
                        )}
                        {teacher.status === "signed-in" && (
                          <button
                            type="button"
                            onClick={() => setSignOutTeacherRecord(teacher)}
                            className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-violet-500"
                          >
                            <LogOutIcon className="h-3 w-3" />
                            <span>Sign Out</span>
                          </button>
                        )}
                        {teacher.status === "signed-out" && (
                          <button
                            type="button"
                            onClick={() => setSignInTeacherRecord(teacher)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Re-open
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationFooter
            startEntry={startEntry}
            endEntry={endEntry}
            totalEntries={filtered.length}
            singularLabel={singularLabel}
            pluralLabel={pluralLabel}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            ariaLabel="Staff attendance pagination"
          />
        )}
      </section>

      {/* Sign-In Dialog Modal */}
      {signInTeacherRecord && (
        <SignInModal
          record={signInTeacherRecord}
          adminName={currentUser ? `${currentUser.name} (Admin)` : "Grace Okafor (Admin)"}
          onClose={() => setSignInTeacherRecord(null)}
          onSuccess={(msg) => {
            setFeedback({ type: "success", message: msg });
            setSignInTeacherRecord(null);
          }}
        />
      )}

      {/* Sign-Out Dialog Modal */}
      {signOutTeacherRecord && (
        <SignOutModal
          record={signOutTeacherRecord}
          adminName={currentUser ? `${currentUser.name} (Admin)` : "Grace Okafor (Admin)"}
          onClose={() => setSignOutTeacherRecord(null)}
          onSuccess={(msg) => {
            setFeedback({ type: "success", message: msg });
            setSignOutTeacherRecord(null);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Staff / Teacher Card Component
// -------------------------------------------------------------------------------------------------
function TeacherCard({
  record,
  onQuickSignIn,
  onOpenSignInModal,
  onOpenSignOutModal,
}: {
  record: TeacherAttendanceRecord;
  onQuickSignIn: () => void;
  onOpenSignInModal: () => void;
  onOpenSignOutModal: () => void;
}) {
  const meta = STATUS_META[record.status];
  const roleMeta = ROLE_META[record.ministryRole];

  return (
    <article
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border p-4.5 transition-colors",
        record.status === "signed-in"
          ? "border-emerald-300 bg-white shadow-2xs"
          : "border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700 ring-1 ring-indigo-500/15">
            {record.avatarInitials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold text-slate-900">{record.name}</h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  roleMeta.badge,
                )}
              >
                {roleMeta.label}
              </span>
            </div>
            <p className="truncate text-xs text-slate-500">
              {record.roomNumber} · {record.assignedClass}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
            meta.badge,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>

      <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Role on Duty:</span>
          <span className="font-semibold text-slate-900">{record.serviceRole}</span>
        </div>
        {record.status === "signed-in" && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Signed In At:</span>
            <span className="font-semibold tabular-nums text-emerald-700">
              {record.signedInAt}
            </span>
          </div>
        )}
        {record.status === "signed-out" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">In / Out:</span>
              <span className="font-semibold tabular-nums text-slate-800">
                {record.signedInAt} → {record.signedOutAt}
              </span>
            </div>
          </>
        )}
        {record.phone && (
          <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-500">
            <span>Contact:</span>
            <span className="tabular-nums font-medium text-slate-700">{record.phone}</span>
          </div>
        )}
        {record.notes && (
          <p className="mt-1 border-t border-slate-200/60 pt-1 text-[11px] italic text-slate-600">
            &ldquo;{record.notes}&rdquo;
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
        {record.status === "expected" && (
          <>
            <button
              type="button"
              onClick={onQuickSignIn}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={onOpenSignInModal}
              className="flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Room / Role
            </button>
          </>
        )}

        {record.status === "signed-in" && (
          <button
            type="button"
            onClick={onOpenSignOutModal}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-violet-500"
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Sign Out (Complete Shift)</span>
          </button>
        )}

        {record.status === "signed-out" && (
          <button
            type="button"
            onClick={onOpenSignInModal}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <span>Re-open Shift</span>
          </button>
        )}
      </div>
    </article>
  );
}

// -------------------------------------------------------------------------------------------------
// Sign-In Modal
// -------------------------------------------------------------------------------------------------
function SignInModal({
  record,
  adminName,
  onClose,
  onSuccess,
}: {
  record: TeacherAttendanceRecord;
  adminName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [roomNumber, setRoomNumber] = useState(record.roomNumber);
  const [serviceRole, setServiceRole] = useState<ServiceRole>(record.serviceRole);
  const [notes, setNotes] = useState(record.notes ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = signInTeacher(record.id, {
      serviceRole,
      roomNumber,
      notes,
      adminName,
    });
    if (res.success) {
      onSuccess(`Signed in ${record.name} (${record.ministryRole}) to ${roomNumber} as ${serviceRole}.`);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 id="signin-modal-title" className="text-base font-bold text-slate-900">
              Sign In Staff Member
            </h3>
            <p className="text-xs text-slate-500">
              {record.name} · {record.ministryRole} · Check-in Verification
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Classroom &amp; Room Assignment
            </label>
            <div className="relative mt-1.5">
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              >
                {ROOM_OPTIONS.filter((o) => o.id !== "all").map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Service Role for Today
            </label>
            <div className="relative mt-1.5">
              <select
                value={serviceRole}
                onChange={(e) => setServiceRole(e.target.value as ServiceRole)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              >
                {SERVICE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Check-in Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prepared craft materials, covering shift"
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 flex-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 flex-1 rounded-xl bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
            >
              Confirm Sign-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Sign-Out Modal
// -------------------------------------------------------------------------------------------------
function SignOutModal({
  record,
  adminName,
  onClose,
  onSuccess,
}: {
  record: TeacherAttendanceRecord;
  adminName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [notes, setNotes] = useState(record.notes ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = signOutTeacher(record.id, { notes, adminName });
    if (res.success) {
      onSuccess(`Signed out ${record.name} (${record.ministryRole}). Shift marked complete.`);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 id="signout-modal-title" className="text-base font-bold text-slate-900">
              Sign Out Staff Member
            </h3>
            <p className="text-xs text-slate-500">Record departure and conclude shift</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
            <p className="font-semibold text-slate-800">
              {record.name} · {record.ministryRole}
            </p>
            <p className="text-slate-500 mt-0.5">
              {record.roomNumber} ({record.assignedClass}) · {record.serviceRole}
            </p>
            <p className="mt-2 text-slate-700">
              Checked in at: <span className="font-bold tabular-nums">{record.signedInAt}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Departure Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed shifts, room tidied, briefing held"
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 flex-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 flex-1 rounded-xl bg-violet-600 text-xs font-semibold text-white shadow-xs hover:bg-violet-500"
            >
              Confirm Sign-Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
