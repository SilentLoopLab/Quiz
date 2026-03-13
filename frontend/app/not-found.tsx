"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-20 top-12 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />

      <section className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-slate-700/70 bg-slate-900/80 p-8 text-center shadow-[0_34px_72px_-30px_rgba(2,6,23,0.95)] backdrop-blur-xl sm:p-12">
        <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200">
          Quizz Portal
        </span>

        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-500">
            Error 404
          </p>
          <h1 className="bg-gradient-to-r from-cyan-200 via-slate-50 to-emerald-200 bg-clip-text text-6xl font-semibold tracking-tight text-transparent sm:text-7xl">
            Page not found
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            The page you requested does not exist or may have been moved. Head
            back to your dashboard and continue with your quizzes.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/home"
            className="inline-flex min-w-40 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-cyan-300/80 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Go home
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex min-w-40 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
          >
            Go back
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          <span className="h-px w-12 bg-slate-700" />
          <span>Quiz • Learn • Improve</span>
          <span className="h-px w-12 bg-slate-700" />
        </div>
      </section>
    </main>
  );
}
