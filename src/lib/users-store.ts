"use client";

import { useSyncExternalStore } from "react";
import type { Role } from "@/lib/navigation";

export type UserStatus = "active" | "invited" | "suspended";

export type MinistryUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatarInitials: string;
  department: string;
  assignedClass?: string;
  phone?: string;
  status: UserStatus;
  joinedDate: string;
  lastActive: string;
};

export type NewMinistryUser = {
  name: string;
  email: string;
  role: Role;
  title?: string;
  department?: string;
  assignedClass?: string;
  phone?: string;
};

const DEFAULT_USERS: MinistryUser[] = [
  {
    id: "usr-admin",
    name: "Grace Okafor",
    email: "admin@theark.church",
    role: "Admin",
    title: "Children's Ministry Director",
    avatarInitials: "GO",
    department: "Directorate & Administration",
    phone: "(555) 012-4411",
    status: "active",
    joinedDate: "Jan 15, 2024",
    lastActive: "Just now",
  },
  {
    id: "usr-leader",
    name: "Ruth Mensah",
    email: "leader@theark.church",
    role: "Leader",
    title: "Ministry Coordinator",
    avatarInitials: "RM",
    department: "Family & Volunteer Care",
    phone: "(555) 014-4820",
    status: "active",
    joinedDate: "Feb 1, 2024",
    lastActive: "12 mins ago",
  },
  {
    id: "usr-teacher",
    name: "Daniel Kim",
    email: "teacher@theark.church",
    role: "Teacher",
    title: "Kingdom Kids Lead Teacher",
    avatarInitials: "DK",
    department: "Sunday School Education",
    assignedClass: "Kingdom Kids (Ages 5–7)",
    phone: "(555) 032-7788",
    status: "active",
    joinedDate: "Mar 10, 2024",
    lastActive: "1 hour ago",
  },
  {
    id: "usr-4",
    name: "Sarah Adebayo",
    email: "sarah.adebayo@theark.church",
    role: "Teacher",
    title: "Overcomers Teacher",
    avatarInitials: "SA",
    department: "Sunday School Education",
    assignedClass: "Overcomers (Ages 8–11)",
    phone: "(555) 041-9922",
    status: "active",
    joinedDate: "Apr 2, 2024",
    lastActive: "Today",
  },
  {
    id: "usr-5",
    name: "Marcus Johnson",
    email: "marcus.j@theark.church",
    role: "Leader",
    title: "Security & Kiosk Supervisor",
    avatarInitials: "MJ",
    department: "Kiosk & Safety Operations",
    phone: "(555) 066-1170",
    status: "active",
    joinedDate: "Feb 20, 2024",
    lastActive: "2 hours ago",
  },
  {
    id: "usr-6",
    name: "Naomi Grace",
    email: "naomi.grace@theark.church",
    role: "Teacher",
    title: "Little Lights Lead Teacher",
    avatarInitials: "NG",
    department: "Early Childhood",
    assignedClass: "Little Lights (Ages 2–4)",
    phone: "(555) 072-3388",
    status: "active",
    joinedDate: "May 14, 2024",
    lastActive: "Yesterday",
  },
  {
    id: "usr-7",
    name: "Tunde Adeyemi",
    email: "tunde.a@theark.church",
    role: "Teacher",
    title: "Kingdom Kids Assistant",
    avatarInitials: "TA",
    department: "Sunday School Education",
    assignedClass: "Kingdom Kids (Ages 5–7)",
    phone: "(555) 019-2210",
    status: "active",
    joinedDate: "Jun 1, 2024",
    lastActive: "3 days ago",
  },
  {
    id: "usr-8",
    name: "Priya Patel",
    email: "priya.p@theark.church",
    role: "Leader",
    title: "Curriculum & Lesson Planner",
    avatarInitials: "PP",
    department: "Curriculum Development",
    phone: "(555) 093-7712",
    status: "active",
    joinedDate: "Mar 22, 2024",
    lastActive: "4 hours ago",
  },
  {
    id: "usr-9",
    name: "David Reed",
    email: "david.reed@theark.church",
    role: "Leader",
    title: "Facilities & Safety Officer",
    avatarInitials: "DR",
    department: "Operations & Facilities",
    phone: "(555) 104-8890",
    status: "active",
    joinedDate: "Jul 18, 2024",
    lastActive: "Yesterday",
  },
  {
    id: "usr-10",
    name: "Funke Bello",
    email: "funke.bello@theark.church",
    role: "Admin",
    title: "Assistant Ministry Director",
    avatarInitials: "FB",
    department: "Directorate & Administration",
    phone: "(555) 081-5520",
    status: "active",
    joinedDate: "Jan 20, 2024",
    lastActive: "5 mins ago",
  },
  {
    id: "usr-11",
    name: "Emmanuel Osei",
    email: "emmanuel.osei@theark.church",
    role: "Teacher",
    title: "Music & Praise Coordinator",
    avatarInitials: "EO",
    department: "Worship & Arts",
    assignedClass: "Overcomers (Ages 8–11)",
    phone: "(555) 061-3345",
    status: "active",
    joinedDate: "Aug 5, 2024",
    lastActive: "2 days ago",
  },
  {
    id: "usr-12",
    name: "Hannah Reed",
    email: "hannah.reed@theark.church",
    role: "Teacher",
    title: "Little Lights Assistant",
    avatarInitials: "HR",
    department: "Early Childhood",
    assignedClass: "Little Lights (Ages 2–4)",
    phone: "(555) 104-8895",
    status: "invited",
    joinedDate: "Nov 1, 2024",
    lastActive: "Pending invite",
  },
];

const STORAGE_KEY = "theark_users_directory";
const CHANGE_EVENT = "theark_users_change";

let memoryUsers: MinistryUser[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  listeners.forEach((listener) => listener());
}

function loadUsers(): MinistryUser[] {
  if (typeof window === "undefined") {
    return DEFAULT_USERS;
  }
  if (memoryUsers) {
    return memoryUsers;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  memoryUsers = DEFAULT_USERS;
  return DEFAULT_USERS;
}

function saveUsers(users: MinistryUser[]) {
  memoryUsers = users;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  let onStorage: ((e: StorageEvent) => void) | null = null;
  let onCustom: (() => void) | null = null;

  if (typeof window !== "undefined") {
    onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        memoryUsers = null;
        listener();
      }
    };
    onCustom = () => {
      listener();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, onCustom);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      if (onStorage) window.removeEventListener("storage", onStorage);
      if (onCustom) window.removeEventListener(CHANGE_EVENT, onCustom);
    }
  };
}

function getSnapshot(): MinistryUser[] {
  return loadUsers();
}

function getServerSnapshot(): MinistryUser[] {
  return DEFAULT_USERS;
}

export function useUsers(): MinistryUser[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const DEFAULT_TITLES: Record<Role, string> = {
  Admin: "Ministry Administrator",
  Leader: "Ministry Coordinator",
  Teacher: "Class Teacher",
};

export function updateUserRole(userId: string, newRole: Role): { success: boolean; error?: string } {
  const currentUsers = loadUsers();
  const targetIndex = currentUsers.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: "User not found." };
  }

  const targetUser = currentUsers[targetIndex];

  // Safeguard: Ensure at least one active Admin exists
  if (targetUser.role === "Admin" && newRole !== "Admin") {
    const adminCount = currentUsers.filter((u) => u.role === "Admin" && u.status === "active").length;
    if (adminCount <= 1) {
      return {
        success: false,
        error: "Cannot change role: the ministry requires at least one active Administrator.",
      };
    }
  }

  const updated: MinistryUser = {
    ...targetUser,
    role: newRole,
    title:
      targetUser.title === DEFAULT_TITLES[targetUser.role]
        ? DEFAULT_TITLES[newRole]
        : targetUser.title,
    assignedClass: newRole === "Teacher" ? (targetUser.assignedClass || "Kingdom Kids (Ages 5–7)") : undefined,
  };

  const nextUsers = [...currentUsers];
  nextUsers[targetIndex] = updated;
  saveUsers(nextUsers);

  // If this user is currently in the active auth session, update their session too
  if (typeof window !== "undefined") {
    try {
      const authRaw = localStorage.getItem("theark_auth_user_session");
      if (authRaw && authRaw !== "null" && authRaw !== "default") {
        const authUser = JSON.parse(authRaw);
        if (authUser?.id === userId || authUser?.email.toLowerCase() === targetUser.email.toLowerCase()) {
          const updatedAuth = {
            ...authUser,
            role: newRole,
            title: updated.title,
            assignedClass: updated.assignedClass,
          };
          localStorage.setItem("theark_auth_user_session", JSON.stringify(updatedAuth));
          window.dispatchEvent(new Event("theark_auth_change"));
        }
      }
    } catch {
      // ignore
    }
  }

  return { success: true };
}

export function updateUserStatus(userId: string, newStatus: UserStatus): { success: boolean; error?: string } {
  const currentUsers = loadUsers();
  const targetIndex = currentUsers.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: "User not found." };
  }

  const targetUser = currentUsers[targetIndex];
  if (targetUser.role === "Admin" && newStatus !== "active") {
    const adminCount = currentUsers.filter((u) => u.role === "Admin" && u.status === "active").length;
    if (adminCount <= 1) {
      return {
        success: false,
        error: "Cannot suspend or deactivate the sole active Administrator.",
      };
    }
  }

  const nextUsers = [...currentUsers];
  nextUsers[targetIndex] = { ...targetUser, status: newStatus };
  saveUsers(nextUsers);

  return { success: true };
}

export function addMinistryUser(input: NewMinistryUser): { success: boolean; user?: MinistryUser; error?: string } {
  const cleanName = input.name.trim();
  const cleanEmail = input.email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, error: "Please enter the user's full name." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please provide a valid ministry email address." };
  }

  const currentUsers = loadUsers();
  if (currentUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "A user with this email address already exists." };
  }

  const initials = cleanName
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("") || "US";

  const newUser: MinistryUser = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: input.role,
    title: input.title?.trim() || DEFAULT_TITLES[input.role],
    avatarInitials: initials,
    department: input.department?.trim() || (input.role === "Admin" ? "Directorate & Administration" : input.role === "Leader" ? "Ministry Operations" : "Sunday School Education"),
    assignedClass: input.role === "Teacher" ? (input.assignedClass?.trim() || "Unassigned") : undefined,
    phone: input.phone?.trim() || undefined,
    status: "active",
    joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    lastActive: "Just now",
  };

  saveUsers([newUser, ...currentUsers]);
  return { success: true, user: newUser };
}

export function resetUsersDirectory() {
  saveUsers(DEFAULT_USERS);
}
