"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

type HostedEvent = {
  _id: string;
  name?: string;
  description?: string;
  location?: string;
  eventDate?: number;
  dateString?: string;
  price?: number;
  totalTickets?: number;
  ticketsSold?: number;
  isPaused?: boolean;
  isSoldOut?: boolean;
  createdAt?: number;
  imageUrl?: string | null;
  isPromoted?: boolean;
  promotionTier?: string;
  promotionEndsAt?: number;
  featuredWeight?: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function dateLabel(event: HostedEvent) {
  if (event.dateString) return event.dateString;
  if (event.eventDate) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(event.eventDate));
  }
  return "Date pending";
}


function boostEndLabel(value?: number) {
  if (!value) return "Active now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function pct(sold = 0, total = 0) {
  if (!total) return 0;
  return Math.min(100, Math.round((sold / total) * 100));
}

export default function HostPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const events = useQuery(
    api.events.getMyEvents,
    isLoaded && isSignedIn ? {} : "skip"
  ) as HostedEvent[] | undefined;

  const unpromoteEvent = useMutation(api.events.unpromoteEvent);

  const analytics = useQuery(
    api.analytics.getOrganizerAnalytics,
    isLoaded && isSignedIn ? {} : "skip"
  ) as
    | {
        grossSales?: number;
        ticketsSold?: number;
        upcomingEvents?: number;
      }
    | undefined;

  const boostOrders =
    (useQuery(
      api.events.getBoostOrdersForMyEvents,
      isLoaded && isSignedIn ? {} : "skip"
    ) as
      | {
          _id: string;
          amount?: number;
          status?: string;
          tier?: string;
          createdAt?: number;
        }[]
      | undefined) ?? [];

  const isLoading = !isLoaded || (isSignedIn && events === undefined);

  const stats = useMemo(() => {
    const list = events ?? [];

    const grossSales =
      analytics?.grossSales ??
      list.reduce((sum, event) => {
        const sold = event.ticketsSold ?? 0;
        const price = event.price ?? 0;
        return sum + sold * price;
      }, 0);

    const ticketsSold =
      analytics?.ticketsSold ??
      list.reduce((sum, event) => sum + (event.ticketsSold ?? 0), 0);

    const upcomingEvents =
      analytics?.upcomingEvents ??
      list.filter((event) => {
        if (!event.eventDate) return true;
        return event.eventDate >= Date.now();
      }).length;

    const totalCapacity = list.reduce(
      (sum, event) => sum + (event.totalTickets ?? 0),
      0
    );

    return {
      grossSales,
      ticketsSold,
      upcomingEvents,
      totalCapacity,
      sellThrough: pct(ticketsSold, totalCapacity),
    };
  }, [events, analytics]);

  const hostedEvents = useMemo(() => {
    return [...(events ?? [])].sort((a, b) => {
      const aDate = a.eventDate ?? a.createdAt ?? 0;
      const bDate = b.eventDate ?? b.createdAt ?? 0;
      return bDate - aDate;
    });
  }, [events]);

  const recentActivity = hostedEvents.slice(0, 4);

  const hasStripe =
    Boolean(user?.publicMetadata?.stripeConnectAccountId) ||
    Boolean(user?.publicMetadata?.stripeAccountId);

  const payoutReady =
    Boolean(user?.publicMetadata?.stripeOnboardingComplete) ||
    Boolean(user?.publicMetadata?.payoutsEnabled);

  
  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">Sign in required</h1>
          <p className="mt-3 text-zinc-400">
            You must be signed in to access organizer tools.
          </p>
        </div>
      </main>
    );
  }

return (
    <main className="safe-x min-h-screen overflow-x-hidden bg-black pb-24 text-white md:pb-0">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-12%] h-[360px] w-[360px] rounded-full bg-violet-600/20 blur-[110px] sm:h-[520px] sm:w-[520px]" />

        <div className="absolute right-[-20%] top-[18%] h-[420px] w-[420px] rounded-full bg-white/10 blur-[150px] sm:right-[-10%] sm:h-[600px] sm:w-[600px]" />

        <div className="absolute bottom-[-18%] left-[10%] h-[420px] w-[420px] rounded-full bg-violet-800/20 blur-[130px] sm:left-[30%] sm:h-[560px] sm:w-[560px]" />

        <div className="absolute left-[12%] top-[28%] h-3 w-3 animate-pulse rounded-full bg-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.85)]" />

        <div className="absolute right-[20%] top-[40%] h-2 w-2 animate-pulse rounded-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.85)]" />

        <div className="absolute left-[48%] top-[70%] h-2 w-2 animate-pulse rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.85)]" />

        <div className="absolute inset-0 opacity-[0.025]">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>
      </div>

      <section className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/[0.05]" />
          <div className="absolute left-1/2 top-[120px] h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-violet-400/[0.05]" />
          <div className="absolute left-1/2 top-[120px] h-[920px] w-[920px] -translate-x-1/2 rounded-full border border-orange-400/[0.04]" />

          <div className="absolute left-[18%] top-[180px] h-3 w-3 animate-pulse rounded-full bg-orange-400 shadow-[0_0_25px_rgba(251,146,60,0.9)]" />
          <div className="absolute right-[22%] top-[320px] h-2 w-2 animate-pulse rounded-full bg-violet-400 shadow-[0_0_22px_rgba(167,139,250,0.9)]" />

          <div className="absolute left-1/2 top-[260px] h-[1px] w-[320px] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
          <div className="absolute left-1/2 top-[120px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
        </div>

        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 shadow-[0_0_120px_rgba(139,92,246,0.14)] backdrop-blur-2xl sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-[-140px] top-[20%] h-[420px] w-[420px] rounded-full bg-orange-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-120px] left-[35%] h-[300px] w-[300px] rounded-full bg-violet-400/10 blur-3xl" />

          <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
            <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:72px_72px]" />
          </div>
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-violet-200 sm:text-xs">
                OutsideCrowd Organizer OS
              </div>

              <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.82] tracking-[-0.06em] sm:text-7xl lg:text-[6.4rem]">
                Host Command Center
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                Manage events, revenue, tickets, merch, check-in, and performance
                from one premium organizer workspace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  Systems Online
                </div>

                <div className="flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-violet-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />
                  Organizer Active
                </div>

                <div className="flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-100">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300" />
                  Live Event Network
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap lg:max-w-[520px] lg:justify-end">
              <TopAction href="/" label="Home" />
              <TopAction href="/events" label="Events" />
              <TopAction href="/host/flyer-studio" label="Flyer Studio" />
              <TopAction href="/host/creative-library" label="Creative Library" />
              <TopAction href="/host/merch" label="Merch OS" />
              <Link
                href="/create-event"
                className="group relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-orange-500 px-5 py-4 text-center text-sm font-black uppercase tracking-wide text-white shadow-[0_0_45px_rgba(139,92,246,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_70px_rgba(249,115,22,0.22)] sm:col-span-1"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/15 opacity-0 transition group-hover:opacity-100" />
                <span className="relative z-10">Create Event →</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat title="Gross Sales" value={money(stats.grossSales)} detail="Organizer revenue" />
          <Stat title="Tickets Sold" value={stats.ticketsSold.toLocaleString()} detail={`${stats.sellThrough}% sell-through`} />
          <Stat title="Upcoming" value={stats.upcomingEvents.toLocaleString()} detail="Live or scheduled" />
          <Stat title="Capacity" value={stats.totalCapacity.toLocaleString()} detail="Ticket inventory" />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300/70">
                Demand Signal
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Ticket Momentum
              </h2>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-orange-400 to-white shadow-[0_0_28px_rgba(249,115,22,0.45)]"
                  style={{ width: `${stats.sellThrough}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniMetric label="Sell Through" value={`${stats.sellThrough}%`} />
                <MiniMetric label="Sold" value={stats.ticketsSold.toLocaleString()} />
                <MiniMetric label="Events" value={stats.upcomingEvents.toLocaleString()} />
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[2rem] border border-violet-300/15 bg-gradient-to-br from-violet-500/10 to-black p-6 shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/20" />
            <div className="relative z-10 flex min-h-[190px] flex-col items-center justify-center text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-200/70">
                Live Pulse
              </p>
              <p className="mt-4 text-6xl font-black tracking-[-0.06em] text-white">
                {stats.sellThrough}%
              </p>
              <p className="mt-2 text-sm text-white/50">
                current organizer sell-through
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 relative overflow-hidden rounded-[2.25rem] border border-violet-300/15 bg-gradient-to-r from-violet-500/10 via-white/[0.035] to-orange-500/10 p-7 shadow-[0_0_80px_rgba(139,92,246,0.12)] backdrop-blur-xl">
          <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="pointer-events-none absolute left-[35%] top-0 h-px w-72 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-200/70">
                Launch Suite
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Build demand before doors open.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Coordinate creative, ticketing, boosts, and merch from one launch command strip.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-black text-white/75 sm:grid-cols-4 lg:min-w-[520px]">
              <LaunchSignal label="Flyers" status="Creative" />
              <LaunchSignal label="Merch" status="Revenue" />
              <LaunchSignal label="Venue Rules" status="Trust" />
              <LaunchSignal label="Ticketing" status="Live" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300/70">
                Organizer Modes
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Choose your operating lane.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <OperatingMode
              href="/create-event"
              label="Launch"
              icon="🚀"
              title="Create Event"
              desc="Build the event page, ticketing, venue details, and launch flow."
            />

            <OperatingMode
              href="/host/flyer-studio"
              label="Create"
              icon="✨"
              title="AI Studio"
              desc="Generate flyers, captions, and social assets for promotion."
            />

            <OperatingMode
              href="/host/boost"
              label="Promote"
              icon="📡"
              title="Boost Center"
              desc="Increase visibility and push events into premium discovery."
            />

            <OperatingMode
              href="/host/merch"
              label="Monetize"
              icon="🛍️"
              title="Merch OS"
              desc="Create preorder drops and event-level merchandise revenue."
            />

            <OperatingMode
              href="/host/analytics"
              label="Analyze"
              icon="📊"
              title="Analytics"
              desc="Track revenue, ticket velocity, conversion, and demand."
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <RoadmapPill label="Brand System" status="Live" />
          <RoadmapPill label="Venue Rules" status="Live" />
          <RoadmapPill label="Flyer Studio" status="MVP" />
          <RoadmapPill label="Printful" status="Next" />
        </div>

        <div className="mt-5 relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute left-[-70px] bottom-[-70px] h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300/70">
                Launch Readiness
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Make every event feel ready before it goes public.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
                The best-performing campaigns connect creative, ticketing, rules, and merch before promotion starts.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <ChecklistItem label="Flyer" />
              <ChecklistItem label="Tickets" />
              <ChecklistItem label="Venue Rules" />
              <ChecklistItem label="Merch" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,.65fr)]">
          <section className="min-w-0 rounded-[1.75rem] border border-white/10 bg-zinc-950/70 p-4 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300/70">
                  Active Operations
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Hosted Events
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                  Monitor campaigns, ticket flow, check-in readiness, and revenue signals.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/create-event"
                  className="rounded-2xl border border-orange-300/25 bg-orange-500/10 px-4 py-3 text-center text-sm font-black text-orange-100 transition hover:border-orange-300/50 hover:bg-orange-500/20"
                >
                  New Event →
                </Link>

                <Link
                  href="/host/analytics"
                  className="rounded-2xl border border-violet-300/20 bg-violet-500/10 px-4 py-3 text-center text-sm font-black text-violet-200 transition hover:border-orange-300/50 hover:bg-white/[0.06]"
                >
                  Analytics →
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-zinc-400">
                Loading organizer workspace...
              </div>
            ) : hostedEvents.length === 0 ? (
              <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-orange-400/30 bg-gradient-to-br from-violet-500/15 to-orange-500/10 p-7 shadow-[0_0_70px_rgba(249,115,22,0.12)] sm:p-9">
                <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="pointer-events-none absolute left-[-80px] bottom-[-80px] h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-200/70">
                    Launch Mode
                  </p>

                  <h3 className="mt-3 text-3xl font-black tracking-tight">
                    Your stage is ready.
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
                    Create your first event and unlock tickets, merch, check-in,
                    analytics, boost campaigns, and creative tools.
                  </p>

                  <Link
                    href="/create-event"
                    className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-orange-200"
                  >
                    Create First Event →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hostedEvents.map((event) => {
                  const sold = event.ticketsSold ?? 0;
                  const total = event.totalTickets ?? 0;
                  const progress = pct(sold, total);
                  const revenue = sold * (event.price ?? 0);

                  return (
                    <article
                      key={event._id}
                      className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.025] shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/[0.065] hover:shadow-[0_0_70px_rgba(249,115,22,0.12)] sm:rounded-[1.75rem]"
                    >
                      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition group-hover:opacity-100" />

                      <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-orange-500/10 blur-3xl transition group-hover:bg-orange-500/20" />

                      <div className="pointer-events-none absolute bottom-[-70px] left-[-70px] h-44 w-44 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/20" />
                      <div className="grid min-w-0 gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-orange-500/25 via-zinc-900 to-black lg:h-full">
                          {event.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={event.imageUrl}
                              alt={event.name || "Event image"}
                              className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl">
                              ✦
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-orange-500/10 opacity-60 transition duration-500 group-hover:opacity-100" />

                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                                  Revenue
                                </p>
                                <p className="mt-1 text-lg font-black text-white">
                                  {money(revenue)}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                                  Sell Through
                                </p>
                                <p className="mt-1 text-lg font-black text-orange-200">
                                  {progress}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 p-4 sm:p-5">
                          <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                              <div className="mb-3 flex flex-wrap gap-2">
                                {event.isSoldOut && <Badge label="Sold Out" />}
                                {event.isPaused && <Badge label="Sales Paused" />}
                                {!event.isSoldOut && !event.isPaused && <Badge label="Live" />}
                                <Badge label={`${progress}% Sold`} muted />
                              </div>

                              {event.isPromoted && (
                                <div className="mb-3 rounded-2xl border border-orange-300/25 bg-violet-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-violet-200">
                                  Boost Active · {event.promotionTier || "Spotlight"} · Until {boostEndLabel(event.promotionEndsAt)}
                                </div>
                              )}

                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate text-2xl font-black tracking-tight">
                                    {event.name || "Untitled Event"}
                                  </h3>

                                  <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                                    {dateLabel(event)} · {event.location || "Location pending"}
                                  </p>
                                </div>

                                <div className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
                                  Live Campaign
                                </div>
                              </div>

                              <div className="mt-5 grid grid-cols-3 gap-3">
                                <MiniMetric label="Sold" value={sold.toLocaleString()} />
                                <MiniMetric label="Revenue" value={money(revenue)} />
                                <MiniMetric label="Price" value={money(event.price ?? 0)} />
                              </div>

                              <div className="mt-4">
                                <div className="mb-2 flex justify-between gap-4 text-xs text-zinc-500">
                                  <span>{sold.toLocaleString()} sold</span>
                                  <span className="truncate">
                                    {total ? total.toLocaleString() : "Unlimited"} capacity
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-300 to-white shadow-[0_0_18px_rgba(249,115,22,0.45)]"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="w-full xl:max-w-[560px]">
                              <div className="grid grid-cols-3 gap-3">
                                <Action href={`/events/${event._id}`} label="View" />
                                <Action href={`/host/check-in?eventId=${event._id}`} label="Check-In" featured />
                                <Action href={`/host/analytics?eventId=${event._id}`} label="Analytics" />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedEventId(
                                    expandedEventId === event._id ? null : event._id
                                  )
                                }
                                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-white/70 transition hover:border-orange-300/40 hover:bg-violet-500/10 hover:text-white"
                              >
                                {expandedEventId === event._id ? "Hide Operations" : "Open Operations"}
                              </button>

                              {expandedEventId === event._id && (
                                <div className="mt-3 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <Action href={`/events/${event._id}/edit`} label="Edit" />
                                  <Action href={`/events/${event._id}/tickets`} label="Tickets" />
                                  <Action href={`/events/${event._id}/add-merch`} label="Add Merch" />
                                  <Action href={`/events/${event._id}/edit-merch`} label="Edit Merch" />

                                  {event.isPromoted ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        unpromoteEvent({
                                          eventId: event._id as any,
                                        })
                                      }
                                      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-center text-xs font-bold text-zinc-200 transition hover:border-orange-300/40 hover:bg-violet-500/10 hover:text-white"
                                    >
                                      Unboost
                                    </button>
                                  ) : (
                                    <Action href={`/host/boost?eventId=${event._id}`} label="Boost Event" featured />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="min-w-0 space-y-5">
            <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-6 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300/70">
                Mission Control
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Organizer Pulse
              </h2>

              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-white/35">
                      Command Signal
                    </p>
                    <p className="mt-2 text-4xl font-black tracking-[-0.05em]">
                      {stats.sellThrough}%
                    </p>
                  </div>

                  <div className="relative h-20 w-20 rounded-full border border-orange-300/30 bg-orange-500/10 shadow-[0_0_35px_rgba(249,115,22,0.22)]">
                    <div className="absolute inset-3 rounded-full border border-violet-300/20" />
                    <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_20px_rgba(251,146,60,.9)]" />
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-orange-400 to-white"
                    style={{ width: `${stats.sellThrough}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <MissionMetric
                  label="Tonight's Revenue"
                  value={money(stats.grossSales)}
                  detail="Across active events"
                />

                <MissionMetric
                  label="Active Boosts"
                  value={hostedEvents.filter((event) => event.isPromoted && (!event.promotionEndsAt || event.promotionEndsAt > Date.now())).length.toString()}
                  detail="Promoted signals"
                />

                <MissionMetric
                  label="Launch Readiness"
                  value={hostedEvents.length ? "Online" : "Standby"}
                  detail={hostedEvents.length ? "Events in command view" : "Create your first event"}
                />
              </div>

              <Link
                href="/host/analytics"
                className="mt-5 block rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-black transition hover:bg-orange-200"
              >
                Open Analytics →
              </Link>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300/70">
                Recent Signals
              </p>

              <h3 className="mt-3 text-xl font-black">
                Live activity stream
              </h3>

              <div className="mt-5 space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/45">
                    No event signals yet.
                  </div>
                ) : (
                  recentActivity.map((event) => (
                    <Link
                      key={event._id}
                      href={`/events/${event._id}`}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-orange-300/40 hover:bg-white/[0.05]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">
                          {event.name || "Untitled Event"}
                        </p>
                        <p className="mt-1 truncate text-xs text-white/40">
                          {dateLabel(event)}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-full border border-orange-300/20 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">
                        {event.isPromoted ? "Boosted" : "Live"}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-orange-500/15 bg-orange-500/10 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-200/70">
                AI Recommendation
              </p>
              <h3 className="mt-3 text-xl font-black">
                Push your next event earlier.
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Events with flyers, merch, and boosted discovery should launch earlier to build demand before doors open.
              </p>
              <Link
                href="/host/flyer-studio"
                className="mt-5 inline-flex rounded-full border border-orange-300/30 bg-black/30 px-5 py-3 text-sm font-black text-orange-100 hover:bg-orange-500/20"
              >
                Create Promo Assets →
              </Link>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-2xl backdrop-blur-xl">
              <h2 className="mb-4 text-xl font-black">System Status</h2>

              <Status label="Stripe Connect" value={hasStripe ? "Connected" : "Setup needed"} good={hasStripe} />
              <Status label="Payouts" value={payoutReady ? "Enabled" : "Pending verification"} good={payoutReady} />
              <Status label="Organizer" value={user ? "Online" : "Required"} good={Boolean(user)} />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Action href="/host/profile" label="Profile" />
                <Action href="/host/planner" label="Planner" />
                <Action href="/host/check-in" label="Check-In" />
                <Action href="/host/boost" label="Boost" featured />
              </div>
            </section>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/85 p-3 shadow-[0_-20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <MobileNav href="/create-event" label="Create" primary />
          <MobileNav href="/host/check-in" label="Check-In" />
          <MobileNav href="/host/analytics" label="Analytics" />
        </div>
      </div>
    </main>
  );
}


function MissionMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-orange-300/30 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-16 w-16 rounded-full bg-orange-500/10 blur-2xl transition group-hover:bg-violet-500/20" />
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-white/45">{detail}</p>
    </div>
  );
}

function TopAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-center text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-orange-300/40 hover:bg-white/10 hover:shadow-[0_0_35px_rgba(249,115,22,0.12)]"
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition group-hover:opacity-100" />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

function Stat({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4 shadow-xl backdrop-blur-xl transition hover:border-orange-300/30 hover:bg-white/[0.065] sm:rounded-[1.75rem] sm:p-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition group-hover:opacity-100" />
      <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">
        {title}
      </p>
      <p className="mt-3 truncate text-2xl font-black tracking-tight sm:mt-4 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-zinc-400 sm:mt-2 sm:text-sm">
        {detail}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-orange-300/30 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition group-hover:opacity-100" />
      <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Badge({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={
        muted
          ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-zinc-300"
          : "rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-violet-200"
      }
    >
      {label}
    </span>
  );
}

function Action({
  href,
  label,
  featured = false,
}: {
  href: string;
  label: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        featured
          ? "rounded-2xl border border-orange-300/30 bg-violet-500/15 px-4 py-4 text-center text-xs font-black text-orange-100 transition hover:border-orange-300/60 hover:bg-orange-500/25"
          : "rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-center text-xs font-bold text-zinc-200 transition hover:border-orange-300/40 hover:bg-violet-500/10 hover:text-white"
      }
    >
      {label}
    </Link>
  );
}



function Status({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <span
        className={
          good
            ? "shrink-0 text-sm font-black text-green-300"
            : "shrink-0 text-sm font-black text-violet-300"
        }
      >
        {value}
      </span>
    </div>
  );
}

function MobileNav({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "rounded-2xl bg-gradient-to-r from-orange-400 to-violet-500 px-3 py-3 text-center text-xs font-black uppercase tracking-wide text-white shadow-[0_0_28px_rgba(249,115,22,0.22)]"
          : "rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center text-xs font-black uppercase tracking-wide text-white/80 backdrop-blur-xl"
      }
    >
      {label}
    </Link>
  );
}


function OperatingMode({
  href,
  label,
  icon,
  title,
  desc,
}: {
  href: string;
  label: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[250px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-300/45 hover:bg-white/[0.075] hover:shadow-[0_0_70px_rgba(249,115,22,0.12)]"
    >
      <div className="pointer-events-none absolute right-[-45px] top-[-45px] h-36 w-36 rounded-full bg-orange-500/15 blur-3xl transition group-hover:bg-violet-500/25" />
      <div className="pointer-events-none absolute bottom-[-60px] left-[-40px] h-32 w-32 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-orange-500/15" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] transition group-hover:opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-2xl shadow-[0_0_35px_rgba(139,92,246,0.16)]">
        {icon}
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.85)]" />
      </div>

      <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-orange-300/70">
        {label}
      </p>

      <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/50">
        {desc}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-black text-white/80 transition group-hover:text-orange-200">
          Open Mode →
        </p>

        <div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.04] text-center text-lg leading-8 text-white/60 transition group-hover:border-orange-300/40 group-hover:text-orange-200">
          →
        </div>
      </div>
    </Link>
  );
}


function LaunchSignal({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl transition hover:border-orange-300/30 hover:bg-white/[0.06]">
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet-400 to-orange-300" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
        {status}
      </p>
      <p className="mt-1 text-sm font-black text-white">{label}</p>
    </div>
  );
}

function RoadmapPill({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{status}</p>
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black text-white/75 transition hover:border-orange-300/35 hover:bg-white/[0.06]">
      <span className="mr-2 text-violet-300 transition group-hover:text-orange-300">●</span>
      {label}
    </div>
  );
}

