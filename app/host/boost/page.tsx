"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function BoostEventPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black p-10 text-white">
          Loading Boost Center... <div className="h-12 sm:hidden" />
          <div className="h-12 sm:hidden" />
        </main>
      }
    >
      <BoostEventContent />
    </Suspense>
  );
}

function BoostEventContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBoosting, setIsBoosting] = useState(false);

  const event = useQuery(
    api.events.getById,
    eventId ? { eventId: eventId as Id<"events"> } : "skip",
  );

  const myEvents = useQuery(api.events.getMyEvents) || [];

  useEffect(() => {
    if (searchParams.get("boost") === "success")
      setSuccessMessage(
        "Boost payment confirmed. Your event promotion is activating now.",
      );
    if (searchParams.get("boost") === "cancelled")
      setErrorMessage("Boost checkout was cancelled. No charge was made.");
  }, [searchParams]);

  async function handleBoost(tier: string) {
    if (!eventId || isBoosting) return;

    setIsBoosting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/boost/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          tier,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout failed.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to start checkout:", error);
      setErrorMessage("Unable to start boost checkout. Please try again.");
      setIsBoosting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:px-5 sm:py-10">
        <Link
          href="/host"
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 hover:border-white"
        >
          ← Back to Host Command Center
        </Link>

        <div className="mt-6 sm:mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-8 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-300">
            OutsideCrowd Growth
          </p>

          <h1 className="mt-4 text-3xl sm:text-5xl leading-[1.05] sm:leading-tight font-black tracking-tight">
            Boost Event
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Promote your event across discovery, featured placements, and
            premium surfaces.
          </p>

          {successMessage && (
            <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-500/10 p-4 text-sm font-bold text-green-200">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-200">
              {errorMessage}
            </div>
          )}

          {!eventId ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              No event selected. Choose an event below.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-500/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">
                Selected Event
              </p>

              <h2 className="mt-2 text-xl sm:text-2xl font-black">
                {event?.name || "Loading event..."}
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                {event?.dateString || "Date pending"} ·{" "}
                {event?.location || "Location pending"}
              </p>
            </div>
          )}
        </div>

        {!eventId && myEvents.length > 0 && (
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300">
              Choose Event
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Select an event to boost
            </h2>

            <div className="mt-6 grid gap-3">
              {myEvents.slice(0, 8).map((event) => (
                <Link
                  key={event._id}
                  href={`/host/boost?eventId=${event._id}`}
                  className="flex items-center flex-col sm:flex-row justify-between gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 min-h-[72px] transition hover:border-orange-400/50 hover:bg-orange-500/10"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-black text-white">
                      {event.name || "Untitled Event"}
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                      {event.dateString || "Date pending"} ·{" "}
                      {event.location || "Location pending"}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-black">
                    Boost
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-1 sm:grid-cols-3">
          <BoostPlan
            title="Spotlight"
            price="$15"
            desc="24-hour discovery boost."
            disabled={!eventId || isBoosting}
            onSelect={() => handleBoost("spotlight")}
          />

          <BoostPlan
            title="Weekend Push"
            price="$35"
            desc="3-day featured boost."
            featured
            disabled={!eventId || isBoosting}
            onSelect={() => handleBoost("weekend_push")}
          />

          <BoostPlan
            title="City Takeover"
            price="$75"
            desc="7-day premium placement."
            disabled={!eventId || isBoosting}
            onSelect={() => handleBoost("city_takeover")}
          />
        </div>
      </section>
      <div className="h-12 sm:hidden" />
      <div className="h-12 sm:hidden" />
    </main>
  );
}

function BoostPlan({
  title,
  price,
  desc,
  featured = false,
  disabled = false,
  onSelect,
}: {
  title: string;
  price: string;
  desc: string;
  featured?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={
        featured
          ? "rounded-[2rem] border border-orange-300/40 bg-orange-500/10 p-6"
          : "rounded-[2rem] border border-white/10 bg-white/[0.035] p-6"
      }
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-300">
        {title}
      </p>
      <p className="mt-4 text-4xl font-black">{price}</p>
      <p className="mt-3 text-sm text-zinc-400">{desc}</p>

      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={
          disabled
            ? "mt-7 w-full cursor-not-allowed rounded-2xl bg-zinc-800 px-5 py-4 sm:py-4.5 text-sm font-black text-zinc-500"
            : featured
              ? "mt-7 w-full rounded-2xl bg-orange-500 px-5 py-4 sm:py-4.5 text-sm font-black text-black hover:bg-orange-400"
              : "mt-7 w-full rounded-2xl bg-white px-5 py-4 sm:py-4.5 text-sm font-black text-black hover:bg-zinc-200"
        }
      >
        {disabled ? "Select Event First" : "Checkout"}
      </button>
    </div>
  );
}
