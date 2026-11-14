"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ChevronDownIcon,
  FamilyIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  addFamily,
  addSpouseOrGuardian,
  type GuardianRelation,
} from "@/lib/family-store";

export function AddFamilyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";

  // Household details
  const [surname, setSurname] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [address, setAddress] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");

  // Primary Guardian
  const [primaryName, setPrimaryName] = useState("");
  const [primaryRelation, setPrimaryRelation] = useState<GuardianRelation>("Mother");
  const [primaryEmail, setPrimaryEmail] = useState("");

  // Optional Spouse / Secondary Guardian
  const [includeSpouse, setIncludeSpouse] = useState(false);
  const [spouseName, setSpouseName] = useState("");
  const [spouseRelation, setSpouseRelation] = useState<GuardianRelation>("Father");
  const [spousePhone, setSpousePhone] = useState("");
  const [spouseEmail, setSpouseEmail] = useState("");
  const [spouseAuthorized, setSpouseAuthorized] = useState(true);

  // Emergency Contact
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Keep household name in sync with surname unless manually edited
  const [customHouseholdName, setCustomHouseholdName] = useState(false);

  function handleSurnameChange(value: string) {
    setSurname(value);
    if (!customHouseholdName) {
      setHouseholdName(value.trim() ? `${value.trim()} Household` : "");
    }
  }

  const valid = Boolean(
    surname.trim() &&
      primaryName.trim() &&
      primaryPhone.trim() &&
      (!includeSpouse || (spouseName.trim() && spousePhone.trim())),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const finalHouseholdName = householdName.trim() || `${surname.trim()} Household`;

    const newFamily = addFamily({
      surname: surname.trim(),
      familyName: finalHouseholdName,
      address: address.trim() || undefined,
      primaryGuardianName: primaryName.trim(),
      primaryRelation,
      primaryPhone: primaryPhone.trim(),
      primaryEmail: primaryEmail.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      emergencyPhone: emergencyPhone.trim() || undefined,
    });

    // If spouse details were provided, add spouse to family
    if (includeSpouse && spouseName.trim() && spousePhone.trim()) {
      addSpouseOrGuardian(newFamily.id, {
        name: spouseName.trim(),
        relation: spouseRelation,
        phone: spousePhone.trim(),
        email: spouseEmail.trim() || undefined,
        isSpouse: true,
        defaultAuthorized: spouseAuthorized,
      });
    }

    if (returnTo) {
      router.push(`${returnTo}?familyId=${newFamily.id}`);
    } else {
      router.push("/families");
    }
  }

  const backHref = returnTo || "/families";

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              href={backHref}
              className="text-indigo-600 transition-colors hover:text-indigo-700"
            >
              {returnTo ? "← Back to Child Registration" : "← Back to Families"}
            </Link>
            <span>/</span>
            <span className="text-slate-700">Add Family First</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Register Family Household
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Add the family household first, register the primary guardian and optional spouse, before linking children for Sunday school.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
          Household Directory Verification
        </div>
      </div>

      <section
        aria-labelledby="add-family-form-title"
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs"
      >
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="add-family-form-title"
                className="text-base font-bold tracking-tight text-slate-900"
              >
                Household & Guardian Registration
              </h2>
              <p className="text-xs text-slate-500">
                Fields marked with <span className="font-bold text-rose-600">*</span> are required for Sunday school security.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              <FamilyIcon className="h-3.5 w-3.5" />
              Family First Flow
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          {/* SECTION 1: Household Details */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-slate-900">
              Step 1 · Household &amp; Address Details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="family-surname"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Household / Family Surname <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="family-surname"
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => handleSurnameChange(e.target.value)}
                  placeholder="e.g. Adeyemi"
                  autoComplete="family-name"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="family-household-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Household Display Name
                </label>
                <input
                  id="family-household-name"
                  type="text"
                  value={householdName}
                  onChange={(e) => {
                    setCustomHouseholdName(true);
                    setHouseholdName(e.target.value);
                  }}
                  placeholder="e.g. Adeyemi Household"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="family-address"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Residential Address
                </label>
                <input
                  id="family-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Glover Road, Ikoyi, Lagos"
                  autoComplete="street-address"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="family-primary-phone"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Primary Household Phone <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="family-primary-phone"
                  type="tel"
                  required
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  placeholder="(555) 019-2210"
                  autoComplete="tel"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </fieldset>

          {/* SECTION 2: Primary Guardian */}
          <fieldset className="space-y-4 border-t border-slate-100 pt-5">
            <legend className="text-sm font-bold text-slate-900">
              Step 2 · Primary Parent / Legal Guardian <span className="font-bold text-rose-600">*</span>
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="primary-guardian-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Full Name <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="primary-guardian-name"
                  type="text"
                  required
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  placeholder="e.g. Folake Adeyemi"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="primary-guardian-relation"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Relationship <span className="font-bold text-rose-600">*</span>
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="primary-guardian-relation"
                    value={primaryRelation}
                    onChange={(e) => setPrimaryRelation(e.target.value as GuardianRelation)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Stepmother">Stepmother</option>
                    <option value="Stepfather">Stepfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Foster Parent">Foster Parent</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="primary-guardian-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Email Address <span className="font-normal text-xs text-slate-500">(optional)</span>
                </label>
                <input
                  id="primary-guardian-email"
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  placeholder="e.g. folake.adeyemi@example.com"
                  autoComplete="email"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </fieldset>

          {/* SECTION 3: Spouse / Co-Guardian */}
          <fieldset className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <legend className="text-sm font-bold text-slate-900">
                  Step 3 · Spouse / Co-Guardian Details
                </legend>
                <p className="text-xs text-slate-500">
                  Add the spouse or co-guardian to this household now or at any time later.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeSpouse}
                  onChange={(e) => setIncludeSpouse(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                <span>Add spouse now</span>
              </label>
            </div>

            {includeSpouse && (
              <div className="grid gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="spouse-name"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Spouse Full Name <span className="font-bold text-rose-600">*</span>
                  </label>
                  <input
                    id="spouse-name"
                    type="text"
                    required={includeSpouse}
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    placeholder="e.g. Tunde Adeyemi"
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="spouse-relation"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Relationship
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id="spouse-relation"
                      value={spouseRelation}
                      onChange={(e) => setSpouseRelation(e.target.value as GuardianRelation)}
                      className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Father">Father / Husband</option>
                      <option value="Mother">Mother / Wife</option>
                      <option value="Stepfather">Stepfather</option>
                      <option value="Stepmother">Stepmother</option>
                      <option value="Legal Guardian">Co-Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="spouse-phone"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Spouse Phone <span className="font-bold text-rose-600">*</span>
                  </label>
                  <input
                    id="spouse-phone"
                    type="tel"
                    required={includeSpouse}
                    value={spousePhone}
                    onChange={(e) => setSpousePhone(e.target.value)}
                    placeholder="(555) 019-2211"
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="spouse-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Spouse Email
                  </label>
                  <input
                    id="spouse-email"
                    type="email"
                    value={spouseEmail}
                    onChange={(e) => setSpouseEmail(e.target.value)}
                    placeholder="tunde.adeyemi@example.com"
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={spouseAuthorized}
                      onChange={(e) => setSpouseAuthorized(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600"
                    />
                    <span>Authorized for Sunday school pick-up at kiosk</span>
                  </label>
                </div>
              </div>
            )}
          </fieldset>

          {/* SECTION 4: Emergency Backup Contact */}
          <fieldset className="space-y-4 border-t border-slate-100 pt-5">
            <legend className="text-sm font-bold text-slate-900">
              Step 4 · Emergency Backup Contact <span className="font-normal text-xs text-slate-500">(optional)</span>
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="family-emergency-contact"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Emergency Contact Name &amp; Relation
                </label>
                <input
                  id="family-emergency-contact"
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Grandma Yetunde (Grandmother)"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="family-emergency-phone"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Emergency Contact Phone
                </label>
                <input
                  id="family-emergency-phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(555) 019-9988"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
            <Link
              href={backHref}
              className="flex h-11 flex-1 touch-manipulation items-center justify-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!valid}
              className={cn(
                "flex h-11 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-colors",
                valid
                  ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-100 text-slate-400",
              )}
            >
              <PlusIcon className="h-4 w-4" />
              {returnTo ? "Register family & continue to child" : "Register family household"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
