"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Role } from "@/lib/navigation";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatarInitials: string;
  department: string;
  assignedClass?: string;
};

export const DEMO_USERS: Record<Role, User> = {
  Admin: {
    id: "usr-admin",
    name: "Grace Okafor",
    email: "admin@theark.church",
    role: "Admin",
    title: "Children's Ministry Director",
    avatarInitials: "GO",
    department: "Directorate & Administration",
  },
  Leader: {
    id: "usr-leader",
    name: "Ruth Mensah",
    email: "leader@theark.church",
    role: "Leader",
    title: "Ministry Coordinator",
    avatarInitials: "RM",
    department: "Family & Volunteer Care",
  },
  Teacher: {
    id: "usr-teacher",
    name: "Daniel Kim",
    email: "teacher@theark.church",
    role: "Teacher",
    title: "Kingdom Kids Lead Teacher",
    avatarInitials: "DK",
    assignedClass: "Kingdom Kids (Ages 5–7)",
    department: "Sunday School Education",
  },
};

type AuthContextType = {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string; user?: User };
  loginAs: (role: Role) => User;
  logout: () => void;
  setRole: (role: Role) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "theark_auth_user_session";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("theark_auth_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theark_auth_change", callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "default";
  } catch {
    return "default";
  }
}

function getServerSnapshot(): string {
  return "default";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user: User | null = useMemo(() => {
    if (sessionRaw === "null") {
      return null;
    }
    if (sessionRaw === "default") {
      return DEMO_USERS.Admin;
    }
    try {
      const parsed = JSON.parse(sessionRaw) as User;
      if (parsed && parsed.role) {
        return parsed;
      }
    } catch {
      // fallback
    }
    return DEMO_USERS.Admin;
  }, [sessionRaw]);

  function persistUser(newUser: User | null) {
    try {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.setItem(STORAGE_KEY, "null");
      }
      window.dispatchEvent(new Event("theark_auth_change"));
    } catch {
      // ignore storage errors
    }
  }

  function login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      return { success: false, error: "Please enter your ministry email address." };
    }
    if (!cleanPassword) {
      return { success: false, error: "Please enter your password." };
    }

    // Match existing demo users by email
    const match = (Object.values(DEMO_USERS) as User[]).find(
      (u) => u.email.toLowerCase() === cleanEmail,
    );

    if (match) {
      persistUser(match);
      return { success: true, user: match };
    }

    // Dynamic role deduction for arbitrary emails if tested
    let role: Role = "Teacher";
    if (cleanEmail.includes("admin") || cleanEmail.includes("director")) {
      role = "Admin";
    } else if (cleanEmail.includes("lead") || cleanEmail.includes("coord")) {
      role = "Leader";
    }

    const initials =
      cleanEmail
        .split("@")[0]
        .split(/[._-]/)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("") || "US";

    const customUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      role,
      title: `${role} Officer`,
      avatarInitials: initials,
      department:
        role === "Admin"
          ? "Church Leadership"
          : role === "Leader"
            ? "Ministry Operations"
            : "Sunday School",
      assignedClass: role === "Teacher" ? "Kingdom Kids (Ages 5–7)" : undefined,
    };

    persistUser(customUser);
    return { success: true, user: customUser };
  }

  function loginAs(role: Role): User {
    const targetUser = DEMO_USERS[role];
    persistUser(targetUser);
    return targetUser;
  }

  function logout() {
    persistUser(null);
  }

  function setRole(newRole: Role) {
    if (user) {
      const updated: User = {
        ...user,
        role: newRole,
        title: DEMO_USERS[newRole].title,
        assignedClass: newRole === "Teacher" ? "Kingdom Kids (Ages 5–7)" : undefined,
      };
      persistUser(updated);
    } else {
      loginAs(newRole);
    }
  }

  // Active effective role (fallback to Admin if logged out)
  const role: Role = user?.role ?? "Admin";
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginAs,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
