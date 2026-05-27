"use client";

import Link from "next/link";

const merchStats = [
  { label: "Preorder Revenue", value: "$0", detail: "Coming soon" },
  { label: "Orders", value: "0", detail: "No active orders yet" },
  { label: "Avg. Margin", value: "--", detail: "Connect products" },
  { label: "Cutoff Windows", value: "0", detail: "Set per event" },
];

const roadmap = [
  "Printful product sync",
  "Merch preorder cutoff dates",
  "Organizer merch analytics",
  "Shipping status tracking",
  "Order management dashboard",
];

export default function HostMerchPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12%] top-[-12%] h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[130px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300/70">
              Host Command Center
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              Merch OS
            </h1>

            <p className="mt-4 max-w-2xl text-white/60">
              Build preorder merch, manage order flow, and prepare for Printful
              fulfillment without disrupting event ticketing.
            </p>
          </div>

          <Link href="/host" className="oc-button-secondary">
            Back to Host
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {merchStats.map((stat) => (
            <div key={stat.label} className="oc-card p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                {stat.label}
              </p>
              <h2 className="mt-3 text-3xl font-black">{stat.value}</h2>
              <p className="mt-2 text-sm text-white/50">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="oc-card p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-violet-300/70">
                  Preorder Setup
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Merch before the event launches
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/60">
                MVP Shell
              </span>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-bold text-white">Product Type</p>
                <p className="mt-2 text-sm text-white/50">
                  Shirts, hats, wristbands, posters, VIP bundles, and event
                  drops.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-bold text-white">Cutoff Date</p>
                <p className="mt-2 text-sm text-white/50">
                  Stop preorders automatically before production or event day.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-bold text-white">Fulfillment</p>
                <p className="mt-2 text-sm text-white/50">
                  Prepare for Printful sync, shipping status, and manual pickup.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-bold text-white">Analytics</p>
                <p className="mt-2 text-sm text-white/50">
                  Track preorder demand, revenue, margins, and event-level merch
                  performance.
                </p>
              </div>
            </div>

            <Link href="/host/merch/create" className="oc-button-primary mt-8 w-full sm:w-auto">
              Create Merch Drop
            </Link>
          </section>

          <section className="oc-card p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">
              Architecture Roadmap
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Coming modules
            </h2>

            <div className="mt-6 space-y-3">
              {roadmap.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
