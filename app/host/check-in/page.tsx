"use client";

import Link from "next/link";

export default function HostCheckInPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          Door Operations
        </p>
        <h1 className="mt-2 text-5xl font-black">QR Check-In</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Scanner dashboard, QR validation, duplicate scan prevention, and live attendee count are next in the build plan.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">Coming Next</h2>
          <p className="mt-2 text-zinc-400">
            This page is reserved for the production scanner dashboard.
          </p>
        </div>

        <Link
          href="/host"
          className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black"
        >
          Back to Host Dashboard
        </Link>
      </section>
    </main>
  );
}
