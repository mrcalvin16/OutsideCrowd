"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreateMerchDropPage() {
  const [productName, setProductName] = useState("");
  const [eventName, setEventName] = useState("");
  const [cutoffDate, setCutoffDate] = useState("");
  const [fulfillment, setFulfillment] = useState("Pickup at event");

  return (
    <main className="safe-x min-h-screen overflow-hidden bg-black text-white">
      <section className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300/70">
              Merch OS
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              Create Merch Drop
            </h1>

            <p className="mt-4 max-w-2xl text-white/60">
              Set up preorder merch, cutoff windows, fulfillment rules, and
              event-level sales strategy.
            </p>
          </div>

          <Link href="/host/merch" className="oc-button-secondary">
            Back
          </Link>
        </div>

        <form className="oc-card space-y-5 p-5 sm:p-8">
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-input"
            placeholder="Product name — Class Reunion Tee, VIP Wristband, Event Hoodie..."
          />

          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="form-input"
            placeholder="Attach to event name"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="datetime-local"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              className="form-input"
            />

            <select
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value)}
              className="form-input"
            >
              <option>Pickup at event</option>
              <option>Ship to customer</option>
              <option>Hybrid pickup + shipping</option>
              <option>Printful fulfillment</option>
            </select>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300/70">
              Product Strategy
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniCard title="Preorder Cutoff" text="Stop sales before production." />
              <MiniCard title="Margin Tracking" text="Prepare revenue analytics." />
              <MiniCard title="Fulfillment Status" text="Ready for Printful sync." />
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert("Merch creation backend comes next. Shell is ready.")}
            className="oc-button-primary"
          >
            Save Merch Drop
          </button>
        </form>
      </section>
    </main>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 text-sm text-white/50">{text}</p>
    </div>
  );
}
