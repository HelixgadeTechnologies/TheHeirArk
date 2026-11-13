"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ChevronDownIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { addChild, INITIAL_COHORTS, type Guardian } from "@/lib/children-store";

export function AddChildForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bornOn, setBornOn] = useState("");
  const [classId, setClassId] = useState(INITIAL_COHORTS[0]?.id ?? "little-lights");
  const [guardians, setGuardians] = useState<Guardian[]>([
    { name: "", relation: "Mother", phone: "", authorized: true },
    { name: "", relation: "Father", phone: "", authorized: false },
  ]);
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const parsedAge = Number.parseInt(age, 10);
  const valid =
    name.trim().length > 0 && Number.isFinite(parsedAge) && parsedAge > 0 && Boolean(classId);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") router.push("/children");
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  function updateGuardian(index: number, patch: Partial<Guardian>) {
    setGuardians((current) =>
      current.map((guardian, guardianIndex) =>
        guardianIndex === index ? { ...guardian, ...patch } : guardian,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAgeValue = Number.parseInt(age, 10);
    const primary = guardians.find((guardian) => guardian.name.trim().length > 0);

    if (name.trim().length === 0 || !Number.isFinite(parsedAgeValue) || parsedAgeValue <= 0) {
      return;
    }

    addChild({
      name: name.trim(),
      age: parsedAgeValue,
      classId,
      bornOn: bornOn || undefined,
      guardians:
        primary && guardians.some((guardian) => guardian.name.trim().length > 0)
          ? [primary, ...guardians.filter((guardian) => guardian !== primary)]
          : [primary].filter(Boolean) as Guardian[],
      allergies: allergies.trim() || undefined,
      medicalNotes: medicalNotes.trim() || undefined,
    });

    router.push("/children");
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Sunday · Children&apos;s church
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Add child</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Capture the full profile before the child joins the Sunday service roster.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <PlusIcon className="h-4 w-4" />
              New profile
            </span>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="add-child-details-title"
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="add-child-details-title" className="text-base font-bold tracking-tight">
                Child details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fields marked with a badge are required for the roster.
              </p>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Step 1 of 1 · Profile
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-5">
          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Child
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-name"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
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
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-age"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Age <span className="font-bold text-rose-600">*</span>
                </label>
                <input
                  id="add-child-age"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="e.g. 5"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-born"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Date of birth
                </label>
                <input
                  id="add-child-born"
                  type="date"
                  value={bornOn}
                  onChange={(event) => setBornOn(event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-class"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Class <span className="font-bold text-rose-600">*</span>
                </label>
                <div className="relative mt-1">
                  <select
                    id="add-child-class"
                    value={classId}
                    onChange={(event) => setClassId(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-base font-semibold text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
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

          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Guardian / pickup contact 1 <span className="font-bold text-rose-600">*</span>
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-g1-name"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
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
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g1-relation"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
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
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g1-phone"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Phone
                </label>
                <input
                  id="add-child-g1-phone"
                  type="tel"
                  value={guardians[0]?.phone ?? ""}
                  onChange={(event) => updateGuardian(0, { phone: event.target.value })}
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700">
                <input
                  id="add-child-g1-auth"
                  type="checkbox"
                  checked={guardians[0]?.authorized ?? true}
                  onChange={(event) =>
                    updateGuardian(0, { authorized: event.target.checked })
                  }
                  className="h-5 w-5 accent-indigo-600"
                />
                <label
                  htmlFor="add-child-g1-auth"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Authorized for pick-up
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Guardian / pickup contact 2 <span className="font-medium normal-case tracking-normal">(optional)</span>
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-g2-name"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
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
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g2-relation"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
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
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-g2-phone"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Phone
                </label>
                <input
                  id="add-child-g2-phone"
                  type="tel"
                  value={guardians[1]?.phone ?? ""}
                  onChange={(event) => updateGuardian(1, { phone: event.target.value })}
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700">
                <input
                  id="add-child-g2-auth"
                  type="checkbox"
                  checked={guardians[1]?.authorized ?? false}
                  onChange={(event) => updateGuardian(1, { authorized: event.target.checked })}
                  className="h-5 w-5 accent-indigo-600"
                />
                <label
                  htmlFor="add-child-g2-auth"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Authorized for pick-up
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Health &amp; safety
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="add-child-allergies"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Allergies
                </label>
                <input
                  id="add-child-allergies"
                  type="text"
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  placeholder="e.g. Peanut allergy"
                  autoComplete="off"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="add-child-medical"
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  Medical notes / special care
                </label>
                <input
                  id="add-child-medical"
                  type="text"
                  value={medicalNotes}
                  onChange={(event) => setMedicalNotes(event.target.value)}
                  placeholder="e.g. Needs inhaler with guardian"
                  autoComplete="off"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/children")}
              className="h-12 flex-1 touch-manipulation rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!valid}
              className={cn(
                "flex h-12 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
                valid
                  ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
              )}
            >
              <PlusIcon className="h-4 w-4" />
              Add child
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
