"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = "Pagination",
}: PaginationNavProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-1 sm:justify-end sm:gap-1.5"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 sm:h-8.5 sm:rounded-lg sm:px-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span>Prev</span>
      </button>

      <div className="flex items-center gap-1">
        <span className="px-2 text-xs font-semibold tabular-nums text-slate-600 sm:hidden dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers(currentPage, totalPages).map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8.5 w-6 items-center justify-center text-xs font-semibold text-slate-400"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  "flex h-8.5 w-8.5 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors",
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 sm:h-8.5 sm:rounded-lg sm:px-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
      >
        <span>Next</span>
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

export interface PaginationFooterProps {
  startEntry: number;
  endEntry: number;
  totalEntries: number;
  singularLabel: string;
  pluralLabel: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export function PaginationFooter({
  startEntry,
  endEntry,
  totalEntries,
  singularLabel,
  pluralLabel,
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel,
}: PaginationFooterProps) {
  if (totalEntries === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing{" "}
          <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
            {startEntry}–{endEntry}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
            {totalEntries}
          </strong>{" "}
          {totalEntries === 1 ? singularLabel : pluralLabel}
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          ·
        </span>
        <span>
          Page{" "}
          <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
            {currentPage}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
            {totalPages}
          </strong>
        </span>
      </div>

      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

