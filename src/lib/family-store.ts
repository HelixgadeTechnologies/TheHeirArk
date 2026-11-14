"use client";

import { useSyncExternalStore } from "react";

export type GuardianRelation =
  | "Mother"
  | "Father"
  | "Stepmother"
  | "Stepfather"
  | "Grandmother"
  | "Grandfather"
  | "Aunt"
  | "Uncle"
  | "Foster Parent"
  | "Legal Guardian"
  | "Other";

export type FamilyMember = {
  id: string;
  name: string;
  relation: GuardianRelation;
  phone: string;
  email?: string;
  isPrimary: boolean;
  isSpouse?: boolean;
  defaultAuthorized: boolean;
  notes?: string;
};

export type Family = {
  id: string;
  familyName: string; // e.g. "Adeyemi Household"
  surname: string;
  primaryPhone: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  members: FamilyMember[];
  createdAt: string;
};

export type NewFamily = {
  surname: string;
  familyName?: string;
  primaryGuardianName: string;
  primaryRelation: GuardianRelation;
  primaryPhone: string;
  primaryEmail?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
};

export type NewFamilyMember = {
  name: string;
  relation: GuardianRelation;
  phone: string;
  email?: string;
  isSpouse?: boolean;
  defaultAuthorized?: boolean;
  notes?: string;
};

export const INITIAL_FAMILIES: Family[] = [
  {
    id: "fam-adeyemi-1",
    familyName: "Adeyemi Household",
    surname: "Adeyemi",
    primaryPhone: "(555) 019-2210",
    address: "14 Jubilee Crescent, Lekki Phase 1",
    members: [
      {
        id: "mem-tunde",
        name: "Tunde Adeyemi",
        relation: "Father",
        phone: "(555) 019-2210",
        email: "tunde.a@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-bisi",
        name: "Bisi Adeyemi",
        relation: "Mother",
        phone: "(555) 019-2211",
        email: "bisi.adeyemi@gmail.com",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-01-10",
  },
  {
    id: "fam-mensah-1",
    familyName: "Mensah Household",
    surname: "Mensah",
    primaryPhone: "(555) 014-4821",
    address: "28 Admiralty Way, Victoria Island",
    members: [
      {
        id: "mem-sarah-m",
        name: "Sarah Mensah",
        relation: "Mother",
        phone: "(555) 014-4821",
        email: "sarah.mensah@gmail.com",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-kojo-m",
        name: "Kojo Mensah",
        relation: "Father",
        phone: "(555) 014-4822",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: false,
        notes: "Court order on file: restricted pick-up rights",
      },
    ],
    createdAt: "2024-01-12",
  },
  {
    id: "fam-okafor",
    familyName: "Okafor Household",
    surname: "Okafor",
    primaryPhone: "(555) 045-6632",
    address: "5 Riverview Court, Ikoyi",
    members: [
      {
        id: "mem-grace-o",
        name: "Grace Okafor",
        relation: "Mother",
        phone: "(555) 045-6632",
        email: "admin@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-chidi-o",
        name: "Chidi Okafor",
        relation: "Father",
        phone: "(555) 045-6633",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: false,
      },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "fam-kim",
    familyName: "Kim Household",
    surname: "Kim",
    primaryPhone: "(555) 032-7788",
    address: "8 Greenway Terrace, Maryland",
    members: [
      {
        id: "mem-daniel-k",
        name: "Daniel Kim",
        relation: "Father",
        phone: "(555) 032-7788",
        email: "teacher@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-anna-k",
        name: "Anna Kim",
        relation: "Mother",
        phone: "(555) 032-7789",
        email: "anna.kim@gmail.com",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-01-18",
  },
  {
    id: "fam-johnson",
    familyName: "Johnson Household",
    surname: "Johnson",
    primaryPhone: "(555) 066-1170",
    address: "21 Palm Grove Avenue, Ikeja",
    members: [
      {
        id: "mem-marcus-j",
        name: "Marcus Johnson",
        relation: "Father",
        phone: "(555) 066-1170",
        email: "marcus.j@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-tasha-j",
        name: "Tasha Johnson",
        relation: "Mother",
        phone: "(555) 066-1171",
        email: "tasha.j@gmail.com",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-01-22",
  },
  {
    id: "fam-bello",
    familyName: "Bello Household",
    surname: "Bello",
    primaryPhone: "(555) 081-5520",
    address: "32 Heritage Park, Ikeja GRA",
    members: [
      {
        id: "mem-funke-b",
        name: "Funke Bello",
        relation: "Mother",
        phone: "(555) 081-5520",
        email: "funke.bello@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-kunle-b",
        name: "Kunle Bello",
        relation: "Father",
        phone: "(555) 081-5521",
        email: "kunle.bello@outlook.com",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-01-25",
  },
  {
    id: "fam-thompson",
    familyName: "Thompson Household",
    surname: "Thompson",
    primaryPhone: "(555) 051-9044",
    address: "9 Sunrise Boulevard, Lekki",
    members: [
      {
        id: "mem-rachel-t",
        name: "Rachel Thompson",
        relation: "Mother",
        phone: "(555) 051-9044",
        email: "rachel.t@yahoo.com",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-mark-t",
        name: "Mark Thompson",
        relation: "Father",
        phone: "(555) 051-9045",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-02-01",
  },
  {
    id: "fam-nwosu",
    familyName: "Nwosu Household",
    surname: "Nwosu",
    primaryPhone: "(555) 062-8820",
    address: "17 Olosa Street, Victoria Island",
    members: [
      {
        id: "mem-ngozi-n",
        name: "Ngozi Nwosu",
        relation: "Mother",
        phone: "(555) 062-8820",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-emeka-n",
        name: "Emeka Nwosu",
        relation: "Father",
        phone: "(555) 062-8821",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-02-04",
  },
  {
    id: "fam-osei",
    familyName: "Osei Household",
    surname: "Osei",
    primaryPhone: "(555) 061-3345",
    address: "12 Bishop Kale Close, Surulere",
    members: [
      {
        id: "mem-kwame-o",
        name: "Kwame Osei",
        relation: "Father",
        phone: "(555) 061-3345",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-adwoa-o",
        name: "Adwoa Osei",
        relation: "Mother",
        phone: "(555) 061-3346",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-02-08",
  },
  {
    id: "fam-patel",
    familyName: "Patel Household",
    surname: "Patel",
    primaryPhone: "(555) 093-7712",
    address: "44 Marine Road, Apapa",
    members: [
      {
        id: "mem-priya-p",
        name: "Priya Patel",
        relation: "Mother",
        phone: "(555) 093-7712",
        email: "priya.p@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-raj-p",
        name: "Raj Patel",
        relation: "Father",
        phone: "(555) 093-7713",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: true,
      },
    ],
    createdAt: "2024-02-12",
  },
  {
    id: "fam-reed",
    familyName: "Reed Household",
    surname: "Reed",
    primaryPhone: "(555) 104-8890",
    address: "19 Unity Road, Ikeja",
    members: [
      {
        id: "mem-hannah-r",
        name: "Hannah Reed",
        relation: "Mother",
        phone: "(555) 104-8890",
        email: "hannah.reed@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-david-r",
        name: "David Reed",
        relation: "Father",
        phone: "(555) 104-8891",
        email: "david.reed@theark.church",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: false,
        notes: "Pick-up restriction pending guardian review",
      },
    ],
    createdAt: "2024-02-15",
  },
  {
    id: "fam-grace",
    familyName: "Grace Household",
    surname: "Grace",
    primaryPhone: "(555) 072-3388",
    address: "7 Coral Reef Close, Lekki",
    members: [
      {
        id: "mem-naomi-g",
        name: "Naomi Grace",
        relation: "Mother",
        phone: "(555) 072-3388",
        email: "naomi.grace@theark.church",
        isPrimary: true,
        defaultAuthorized: true,
      },
      {
        id: "mem-peter-g",
        name: "Peter Grace",
        relation: "Father",
        phone: "(555) 072-3389",
        isPrimary: false,
        isSpouse: true,
        defaultAuthorized: false,
      },
    ],
    createdAt: "2024-02-18",
  },
];

const STORAGE_KEY = "theark_families_directory";
const CHANGE_EVENT = "theark_families_change";

let memoryFamilies: Family[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  listeners.forEach((listener) => listener());
}

function loadFamilies(): Family[] {
  if (typeof window === "undefined") {
    return INITIAL_FAMILIES;
  }
  if (memoryFamilies) {
    return memoryFamilies;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryFamilies = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  memoryFamilies = INITIAL_FAMILIES;
  return INITIAL_FAMILIES;
}

function saveFamilies(families: Family[]) {
  memoryFamilies = families;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(families));
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
        memoryFamilies = null;
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

function getSnapshot(): Family[] {
  return loadFamilies();
}

function getServerSnapshot(): Family[] {
  return INITIAL_FAMILIES;
}

export function useFamilies(): Family[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useFamily(familyId: string | undefined): Family | undefined {
  const families = useFamilies();
  if (!familyId) return undefined;
  return families.find((f) => f.id === familyId);
}

export function addFamily(input: NewFamily): Family {
  const cleanSurname = input.surname.trim();
  const householdName = input.familyName?.trim() || `${cleanSurname} Household`;

  const primaryMember: FamilyMember = {
    id: `mem-${Date.now()}-1`,
    name: input.primaryGuardianName.trim(),
    relation: input.primaryRelation,
    phone: input.primaryPhone.trim(),
    email: input.primaryEmail?.trim() || undefined,
    isPrimary: true,
    defaultAuthorized: true,
  };

  const newFamily: Family = {
    id: `fam-${Date.now()}`,
    familyName: householdName,
    surname: cleanSurname,
    primaryPhone: input.primaryPhone.trim(),
    address: input.address?.trim() || undefined,
    emergencyContact: input.emergencyContact?.trim() || undefined,
    emergencyPhone: input.emergencyPhone?.trim() || undefined,
    members: [primaryMember],
    createdAt: new Date().toISOString().split("T")[0],
  };

  const current = loadFamilies();
  const updated = [newFamily, ...current];
  saveFamilies(updated);

  return newFamily;
}

export function addSpouseOrGuardian(
  familyId: string,
  input: NewFamilyMember,
): { success: boolean; member?: FamilyMember; error?: string } {
  const cleanName = input.name.trim();
  const cleanPhone = input.phone.trim();

  if (!cleanName) {
    return { success: false, error: "Please enter the guardian's full name." };
  }
  if (!cleanPhone) {
    return { success: false, error: "Please enter a valid telephone contact." };
  }

  const current = loadFamilies();
  const index = current.findIndex((f) => f.id === familyId);
  if (index === -1) {
    return { success: false, error: "Family household not found." };
  }

  const family = current[index];
  const newMember: FamilyMember = {
    id: `mem-${Date.now()}`,
    name: cleanName,
    relation: input.relation,
    phone: cleanPhone,
    email: input.email?.trim() || undefined,
    isPrimary: false,
    isSpouse: input.isSpouse ?? (input.relation === "Mother" || input.relation === "Father"),
    defaultAuthorized: input.defaultAuthorized ?? true,
    notes: input.notes?.trim() || undefined,
  };

  const updatedFamily: Family = {
    ...family,
    members: [...family.members, newMember],
  };

  const updated = [...current];
  updated[index] = updatedFamily;
  saveFamilies(updated);

  return { success: true, member: newMember };
}

export function updateFamilyMember(
  familyId: string,
  memberId: string,
  patch: Partial<FamilyMember>,
): void {
  const current = loadFamilies();
  const fIndex = current.findIndex((f) => f.id === familyId);
  if (fIndex === -1) return;

  const family = current[fIndex];
  const updatedMembers = family.members.map((m) =>
    m.id === memberId ? { ...m, ...patch } : m,
  );

  const updatedFamily = { ...family, members: updatedMembers };
  const updated = [...current];
  updated[fIndex] = updatedFamily;
  saveFamilies(updated);
}
