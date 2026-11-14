"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CloseIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  INITIAL_COHORTS,
  addChild,
  type ChildGuardianPermission,
  type Guardian,
} from "@/lib/children-store";
import { useFamilies } from "@/lib/family-store";

function suggestedCohort(ageNum: number) {
  const match = INITIAL_COHORTS.find((cohort) => {
    if (cohort.ageMax === null) return ageNum >= cohort.ageMin;
    return ageNum >= cohort.ageMin && ageNum <= cohort.ageMax;
  });

  return match?.id ?? INITIAL_COHORTS[0].id;
}

type PermissionRow = {
  memberId?: string;
  name: string;
  relation: string;
  phone: string;
  canDropOff: boolean;
  canPickUp: boolean;
  isCustom?: boolean;
};

export function AddChildForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFamilyId = searchParams.get("familyId") ?? "";

  const families = useFamilies();

  // Selected Family: defaults to query param or first registered family
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(preselectedFamilyId);
  const activeFamilyId = selectedFamilyId || preselectedFamilyId || (families[0]?.id ?? "");

  const selectedFamily = useMemo(
    () => families.find((family) => family.id === activeFamilyId),
    [families, activeFamilyId],
  );

  // Child details
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bornOn, setBornOn] = useState("");
  const [classId, setClassId] = useState(INITIAL_COHORTS[0].id);
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  // Store user modifications to household members: overrides[memberId]
  const [overrides, setOverrides] = useState<
    Record<string, { canDropOff: boolean; canPickUp: boolean }>
  >({});

  // Store additional designated custom guardians (drivers, nannies, etc.)
  const [customContacts, setCustomContacts] = useState<PermissionRow[]>([]);

  // Derived unified permissions list: computed on the fly without useEffect
  const permissions: PermissionRow[] = useMemo(() => {
    const householdPerms: PermissionRow[] = selectedFamily
      ? selectedFamily.members.map((member) => {
          const override = overrides[member.id];
          return {
            memberId: member.id,
            name: member.name,
            relation: member.relation,
            phone: member.phone,
            canDropOff: override ? override.canDropOff : true,
            canPickUp: override ? override.canPickUp : member.defaultAuthorized,
            isCustom: false,
          };
        })
      : [];

    return [...householdPerms, ...customContacts];
  }, [selectedFamily, overrides, customContacts]);

  // Add extra custom guardian state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customRelation, setCustomRelation] = useState("Driver / Carpool");
  const [customPhone, setCustomPhone] = useState("");
  const [customDropOff, setCustomDropOff] = useState(true);
  const [customPickUp, setCustomPickUp] = useState(true);

  function handleAgeChange(value: string) {
    setAge(value);
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setClassId(suggestedCohort(parsed));
    }
  }

  function updatePermission(perm: PermissionRow, patch: Partial<PermissionRow>) {
    if (perm.isCustom) {
      setCustomContacts((current) =>
        current.map((item) =>
          item.name === perm.name
            ? {
                ...item,
                canDropOff: patch.canDropOff ?? item.canDropOff,
                canPickUp: patch.canPickUp ?? item.canPickUp,
              }
            : item,
        ),
      );
    } else if (perm.memberId) {
      setOverrides((current) => ({
        ...current,
        [perm.memberId!]: {
          canDropOff: patch.canDropOff ?? perm.canDropOff,
          canPickUp: patch.canPickUp ?? perm.canPickUp,
        },
      }));
    }
  }

  function handleAddCustomGuardian(event: FormEvent) {
    event.preventDefault();
    if (!customName.trim()) return;

    setCustomContacts((current) => [
      ...current,
      {
        name: customName.trim(),
        relation: customRelation.trim() || "Emergency Contact",
        phone: customPhone.trim(),
        canDropOff: customDropOff,
        canPickUp: customPickUp,
        isCustom: true,
      },
    ]);

    setCustomName("");
    setCustomPhone("");
    setShowAddCustom(false);
  }

  function removeCustomGuardian(perm: PermissionRow) {
    setCustomContacts((current) => current.filter((item) => item.name !== perm.name));
  }

  const hasAuthorizedPickup = permissions.some((perm) => perm.canPickUp && perm.name.trim());
  const hasDropOff = permissions.some((perm) => perm.canDropOff && perm.name.trim());
  const valid = Boolean(
    name.trim() &&
      age.trim() &&
      activeFamilyId &&
      hasAuthorizedPickup &&
      hasDropOff,
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;

    const parsedAge = Number(age);

    const guardians: Guardian[] = permissions
      .filter((perm) => perm.name.trim().length > 0)
      .map((perm) => ({
        name: perm.name.trim(),
        relation: perm.relation.trim() || "Guardian",
        phone: perm.phone.trim(),
        authorized: perm.canPickUp,
      }));

    const guardianPermissions: ChildGuardianPermission[] = permissions
      .filter((perm) => perm.name.trim().length > 0)
      .map((perm) => ({
        memberId: perm.memberId,
        name: perm.name.trim(),
        relation: perm.relation.trim() || "Guardian",
        phone: perm.phone.trim(),
        canDropOff: perm.canDropOff,
        canPickUp: perm.canPickUp,
        authorized: perm.canPickUp,
      }));

    addChild({
      name: name.trim(),
      age: Number.isNaN(parsedAge) ? 0 : parsedAge,
      classId,
      familyId: activeFamilyId || undefined,
      bornOn: bornOn.trim() || undefined,
      guardians,
      guardianPermissions,
      allergies: allergies.trim() || undefined,
      medicalNotes: medicalNotes.trim() || undefined,
    });

    router.push("/children");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Register Child Profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Connect child to an existing household, then verify authorized drop-off and pick-up guardians before joining class.
          </p>
        </div>
      </div>

      <section
        aria-labelledby="add-child-details-title"
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/90"
      >
        <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="add-child-details-title" className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Child & Family Enrollment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fields marked with <span className="font-bold text-rose-600">*</span> are required.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Family-linked verification
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          {/* STEP 1: Connect to Family */}
          <fieldset className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Step 1 · Connect Child to Family Household <span className="font-bold text-rose-600">*</span>
                </legend>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select the registered family household to import parent and spouse details.
                </p>
              </div>
              <Link
                href="/families/add?returnTo=/children/add"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-3 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100/70"
              >
                <PlusIcon className="h-4 w-4" />
                Add family first
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="select-family"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Select Household <span className="font-bold text-rose-600">*</span>
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="select-family"
                    value={selectedFamilyId}
                    onChange={(event) => setSelectedFamilyId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-900"
                  >
                    {families.map((family) => {
                      const primary = family.members.find((m) => m.isPrimary) ?? family.members[0];
                      const adultCount = family.members.length;
                      return (
                        <option key={family.id} value={family.id}>
                          {family.familyName} · {primary?.name} ({adultCount} adult{adultCount > 1 ? "s" : ""}) · {family.address || family.primaryPhone}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {selectedFamily && (
                <div className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Linked Household
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {selectedFamily.familyName}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {selectedFamily.address} · Primary Phone: {selectedFamily.primaryPhone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                        {selectedFamily.members.length} Household Adult{selectedFamily.members.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </fieldset>

          {/* STEP 2: Child Details */}
          <fieldset className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Step 2 · Child Information
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Child full name <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="add-child-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. David Adeyemi"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="add-child-age"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Age (years) <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="add-child-age"
                  type="number"
                  min={0}
                  max={18}
                  required
                  value={age}
                  onChange={(event) => handleAgeChange(event.target.value)}
                  placeholder="e.g. 7"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="add-child-born"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Date of birth <span className="font-normal text-xs text-slate-500 dark:text-slate-400">(optional)</span>
                </label>
                <input
                  id="add-child-born"
                  type="date"
                  value={bornOn}
                  onChange={(event) => setBornOn(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="add-child-cohort"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Sunday School Cohort
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="add-child-cohort"
                    value={classId}
                    onChange={(event) => setClassId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-900"
                  >
                    {INITIAL_COHORTS.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name} · Ages{" "}
                        {cohort.ageMax === null ? `${cohort.ageMin}+` : `${cohort.ageMin}–${cohort.ageMax}`} ({cohort.room})
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </fieldset>

          {/* STEP 3: Drop-off and Pick-up Guardian Authorization */}
          <fieldset className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Step 3 · Drop-off & Pick-up Authorization <span className="font-bold text-rose-600">*</span>
                </legend>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which household members or designated contacts are permitted to drop off and pick up this child.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustom(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add driver / emergency contact
              </button>
            </div>

            {/* Guardian permissions list */}
            <div className="space-y-3">
              {permissions.map((perm, index) => {
                return (
                  <div
                    key={perm.memberId ?? `custom-${index}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors dark:border-slate-700/80 dark:bg-slate-800/40 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {perm.name}
                        </span>
                        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {perm.relation}
                        </span>
                        {perm.isCustom && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Designated Contact
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {perm.phone || "No phone listed"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* Can drop off toggle */}
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={perm.canDropOff}
                          onChange={(e) =>
                            updatePermission(perm, { canDropOff: e.target.checked })
                          }
                          className="h-4.5 w-4.5 rounded accent-indigo-600"
                        />
                        <span>Can drop off</span>
                      </label>

                      {/* Can pick up toggle */}
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={perm.canPickUp}
                          onChange={(e) =>
                            updatePermission(perm, { canPickUp: e.target.checked })
                          }
                          className="h-4.5 w-4.5 rounded accent-indigo-600"
                        />
                        <span>Can pick up</span>
                      </label>

                      {/* Pick up badge */}
                      {perm.canPickUp ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircleIcon className="h-3 w-3" />
                          Pick-up authorized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
                          Pick-up restricted
                        </span>
                      )}

                      {perm.isCustom && (
                        <button
                          type="button"
                          onClick={() => removeCustomGuardian(perm)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {permissions.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No household members found. Select a family above or add a family first.
                </div>
              )}

              {!hasAuthorizedPickup && permissions.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertTriangleIcon className="h-4 w-4 shrink-0 text-amber-600" />
                  At least one person must be checked for &ldquo;Can pick up&rdquo; to ensure child safety.
                </div>
              )}
            </div>

            {/* Custom contact inline form */}
            {showAddCustom && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between pb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Add Driver or Designated Pick-up Contact
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. John Okoro"
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Relation / Role
                    </label>
                    <input
                      type="text"
                      value={customRelation}
                      onChange={(e) => setCustomRelation(e.target.value)}
                      placeholder="e.g. Driver, Grandparent, Nanny"
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={customDropOff}
                        onChange={(e) => setCustomDropOff(e.target.checked)}
                        className="h-4 w-4 rounded accent-indigo-600"
                      />
                      <span>Drop-off</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={customPickUp}
                        onChange={(e) => setCustomPickUp(e.target.checked)}
                        className="h-4 w-4 rounded accent-indigo-600"
                      />
                      <span>Pick-up</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomGuardian}
                      disabled={!customName.trim()}
                      className="h-8 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          {/* STEP 4: Health, Allergies & Special Care */}
          <fieldset className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Step 4 · Health, Allergies & Special Care
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-allergies"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Allergies
                </label>
                <input
                  id="add-child-allergies"
                  type="text"
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  placeholder="e.g. Peanut allergy, Lactose intolerance"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-medical"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Medical notes / special instructions
                </label>
                <input
                  id="add-child-medical"
                  type="text"
                  value={medicalNotes}
                  onChange={(event) => setMedicalNotes(event.target.value)}
                  placeholder="e.g. Carries inhaler; notify parent if wheezing"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/children")}
              className="h-11 flex-1 touch-manipulation rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!valid}
              className={cn(
                "flex h-11 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-colors",
                valid
                  ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
              )}
            >
              <PlusIcon className="h-4 w-4" />
              Register child
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
