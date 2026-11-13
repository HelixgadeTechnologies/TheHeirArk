"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ChevronDownIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  INITIAL_COHORTS,
  addChild,
  type Guardian,
} from "@/lib/children-store";

function suggestedCohort(ageNum: number) {
  const match = INITIAL_COHORTS.find((cohort) => {
    if (cohort.ageMax === null) return ageNum >= cohort.ageMin;
    return ageNum >= cohort.ageMin && ageNum <= cohort.ageMax;
  });

  return match?.id ?? INITIAL_COHORTS[0].id;
}

export function AddChildForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bornOn, setBornOn] = useState("");
  const [classId, setClassId] = useState(INITIAL_COHORTS[0].id);
  const [guardians, setGuardians] = useState<Guardian[]>([
    { name: "", relation: "Mother", phone: "", authorized: true },
    { name: "", relation: "Father", phone: "", authorized: false },
  ]);
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const valid = Boolean(name.trim() && age.trim() && guardians[0]?.name.trim());

  function handleAgeChange(value: string) {
    setAge(value);
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setClassId(suggestedCohort(parsed));
    }
  }

  function updateGuardian(index: number, patch: Partial<Guardian>) {
    setGuardians((current) => {
      const copy = [...current];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;

    const parsedAge = Number(age);
    const primary = guardians[0];

    addChild({
      name: name.trim(),
      age: Number.isNaN(parsedAge) ? 0 : parsedAge,
      classId,
      bornOn: bornOn.trim() || undefined,
      guardians:
        guardians.length > 1
          ? [primary, ...guardians.filter((guardian) => guardian !== primary)]
          : [primary].filter(Boolean) as Guardian[],
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
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Capture contact information, authorized guardians, and health safeguards before joining Sunday school.
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
                Child & Guardian Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fields marked with <span className="font-bold text-rose-600">*</span> are required for Sunday school records.
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              One-step enrollment
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Child Details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full name <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="add-child-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Ada Okafor"
                  autoComplete="off"
                  autoFocus
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-age"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Age <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="add-child-age"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={age}
                  onChange={(event) => handleAgeChange(event.target.value)}
                  placeholder="e.g. 5"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-born"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Date of birth
                </label>
                <input
                  id="add-child-born"
                  type="date"
                  value={bornOn}
                  onChange={(event) => setBornOn(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-class"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Class Assignment <span className="font-bold text-rose-600">*</span>
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="add-child-class"
                    value={classId}
                    onChange={(event) => setClassId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
                  >
                    {INITIAL_COHORTS.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name} · Ages{" "}
                        {cohort.ageMax === null ? `${cohort.ageMin}+` : `${cohort.ageMin}–${cohort.ageMax}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Primary Guardian / Pick-up Contact <span className="font-bold text-rose-600">*</span>
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-g1-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full name <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="add-child-g1-name"
                  type="text"
                  value={guardians[0]?.name ?? ""}
                  onChange={(event) => updateGuardian(0, { name: event.target.value })}
                  placeholder="e.g. Ngozi Osei"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g1-relation"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Relation
                </label>
                <input
                  id="add-child-g1-relation"
                  type="text"
                  value={guardians[0]?.relation ?? ""}
                  onChange={(event) => updateGuardian(0, { relation: event.target.value })}
                  placeholder="e.g. Mother"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g1-phone"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Phone number
                </label>
                <input
                  id="add-child-g1-phone"
                  type="tel"
                  value={guardians[0]?.phone ?? ""}
                  onChange={(event) => updateGuardian(0, { phone: event.target.value })}
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 dark:border-slate-700/80 dark:bg-slate-800/40">
                <input
                  id="add-child-g1-auth"
                  type="checkbox"
                  checked={guardians[0]?.authorized ?? true}
                  onChange={(event) =>
                    updateGuardian(0, { authorized: event.target.checked })
                  }
                  className="h-4.5 w-4.5 accent-indigo-600 rounded"
                />
                <label
                  htmlFor="add-child-g1-auth"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Authorized for pick-up at kiosk
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Secondary Guardian <span className="font-normal text-xs text-slate-500 dark:text-slate-400">(optional)</span>
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-g2-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full name
                </label>
                <input
                  id="add-child-g2-name"
                  type="text"
                  value={guardians[1]?.name ?? ""}
                  onChange={(event) => updateGuardian(1, { name: event.target.value })}
                  placeholder="e.g. Chidi Okafor"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g2-relation"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Relation
                </label>
                <input
                  id="add-child-g2-relation"
                  type="text"
                  value={guardians[1]?.relation ?? ""}
                  onChange={(event) => updateGuardian(1, { relation: event.target.value })}
                  placeholder="e.g. Father"
                  autoComplete="off"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g2-phone"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Phone number
                </label>
                <input
                  id="add-child-g2-phone"
                  type="tel"
                  value={guardians[1]?.phone ?? ""}
                  onChange={(event) => updateGuardian(1, { phone: event.target.value })}
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 dark:border-slate-700/80 dark:bg-slate-800/40">
                <input
                  id="add-child-g2-auth"
                  type="checkbox"
                  checked={guardians[1]?.authorized ?? false}
                  onChange={(event) => updateGuardian(1, { authorized: event.target.checked })}
                  className="h-4.5 w-4.5 accent-indigo-600 rounded"
                />
                <label
                  htmlFor="add-child-g2-auth"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Authorized for pick-up
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Health, Allergies & Special Care
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
                  placeholder="e.g. Peanut allergy, Dairy"
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
                  placeholder="e.g. Needs inhaler with guardian"
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
