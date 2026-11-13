"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  SmileIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error ?? "Failed to sign in. Please verify your credentials.");
        setLoading(false);
      }
    }, 350);
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient gradient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80">
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 opacity-40 dark:from-indigo-600/15 dark:to-emerald-600/15"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Headline */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <SmileIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Sign in to TheHeirsArk
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Children&apos;s Church Ministry & Dashboard Portal
          </p>
        </div>

        {/* Email & Password Login Form Card */}
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Ministry Email Address
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <MailIcon className="h-4 w-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@theheirsark.church"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockIcon className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Remember this device
                </span>
              </label>

              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                256-bit SSL
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Unified Sign-in Notice */}
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Single unified sign-in:
            </p>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400">
              Admins, Department Leaders, and Sunday School Teachers log in with their ministry email address and are automatically routed to their role dashboard.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          TheHeirsArk Children&apos;s Church Ministry System · &ldquo;Train up a child in the way he should go&rdquo;
        </p>
      </div>

      {/* Forgot Password modal dialog */}
      {forgotOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Reset Ministry Password
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              For church security and child protection standards, password resets are handled directly by your ministry director. Please contact:
            </p>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <p className="font-semibold">TheHeirsArk Admin Desk</p>
              <p className="text-indigo-600 dark:text-indigo-400">admin@theheirsark.church</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Sunday morning desk: Room 101</p>
            </div>
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
