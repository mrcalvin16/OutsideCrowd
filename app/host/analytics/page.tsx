"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AnalyticsTrendChart, {
  type AnalyticsRange,
} from "@/components/host/analytics/AnalyticsTrendChart";
import ConversionFunnel from "@/components/host/analytics/ConversionFunnel";
import TrafficSources from "@/components/host/analytics/TrafficSources";

type EventSalesItem = {
  eventId?: string;
  eventName?: string;
  name?: string;
  ticketsSold?: number;
  revenue?: number;
  totalRevenue?: number;
  pageViews?: number;
};

type RecentSaleItem = {
  ticketId?: string;
  _id?: string;
  eventName?: string;
  amount?: number;
  total?: number;
  buyerEmail?: string;
  userEmail?: string;
  ticketType?: string;
  quantity?: number;
  occurredAt?: number;
};

export default function HostAnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [rangeDays, setRangeDays] =
    useState<AnalyticsRange>(14);

  const analytics = useQuery(
    api.analytics.getOrganizerAnalytics,
    isLoaded && isSignedIn ? {} : "skip"
  );

  const trendData = useQuery(
    api.analytics.getOrganizerTrendSeries,
    isLoaded && isSignedIn
      ? { days: rangeDays }
      : "skip"
  );

  const salesByEvent = (analytics?.salesByEvent ??
    []) as EventSalesItem[];
  const recentSales = (analytics?.recentSales ??
    []) as RecentSaleItem[];

  const grossSales =
    analytics?.grossSales ??
    analytics?.totalRevenue ??
    0;

  const ticketsSold =
    analytics?.ticketsSold ??
    analytics?.totalTicketsSold ??
    0;

  const totalEvents =
    analytics?.totalEvents ??
    analytics?.upcomingEvents ??
    0;

  const avgRevenuePerEvent = useMemo(() => {
    if (!totalEvents) return 0;
    return grossSales / totalEvents;
  }, [grossSales, totalEvents]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading analytics...
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl p-5 sm:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-black">Sign in required</h1>
          <p className="mt-3 text-zinc-400">
            Please sign in to view organizer analytics.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-black text-black"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 sm:px-6 sm:py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
              Organizer Analytics
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl sm:text-5xl font-black">Performance Dashboard</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Track revenue, ticket sales, event performance, and recent buyer activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/host/planner"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold hover:border-orange-400"
            >
              Budget Planner
            </Link>

            <Link
              href="/host"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-black hover:bg-zinc-200"
            >
              Host Dashboard
            </Link>
          </div>
        </div>

        {analytics === undefined ? (
          <div className="max-w-full rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl p-5 sm:p-8 text-zinc-400">
            Loading performance data...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-4">
              <Stat title="Gross Sales" value={`$${grossSales.toLocaleString()}`} />
              <Stat title="Tickets Sold" value={ticketsSold.toLocaleString()} />
              <Stat title="Events" value={totalEvents.toLocaleString()} />
              <Stat
                title="Avg / Event"
                value={`$${Math.round(avgRevenuePerEvent).toLocaleString()}`}
              />
            </div>

            <div className="mt-6 sm:mt-8">
              <AnalyticsTrendChart
                data={trendData?.series}
                days={rangeDays}
                onDaysChange={setRangeDays}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-2">
              <ConversionFunnel
                funnel={analytics.funnel}
              />

              <TrafficSources
                sources={analytics.trafficSources}
                periodDays={analytics.trafficWindowDays}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[1.2fr_.8fr]">
              <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl p-4 sm:p-6">
                <h2 className="text-2xl font-black">Sales by Event</h2>

                <div className="mt-5 space-y-4">
                  {salesByEvent.length === 0 ? (
                    <Empty text="No event sales yet." />
                  ) : (
                    salesByEvent.map((item, index) => (
                      <div
                        key={item.eventId ?? index}
                        className="rounded-2xl border border-white/10 bg-black p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="font-black">
                              {item.eventName ?? item.name ?? "Event"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                              {item.ticketsSold ?? 0} tickets sold
                              <span className="mx-2 text-zinc-700">·</span>
                              {item.pageViews ?? 0} recent views
                            </p>
                          </div>

                          <p className="text-lg font-black text-orange-300">
                            ${(item.revenue ?? item.totalRevenue ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl p-4 sm:p-6">
                <h2 className="text-2xl font-black">Recent Sales</h2>

                <div className="mt-5 space-y-4">
                  {recentSales.length === 0 ? (
                    <Empty text="No recent sales yet." />
                  ) : (
                    recentSales.map((sale, index) => (
                      <div
                        key={sale.ticketId ?? sale._id ?? index}
                        className="rounded-2xl border border-white/10 bg-black p-4"
                      >
                        <p className="font-black">
                          {sale.eventName ?? "Ticket Sale"}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          ${(sale.amount ?? sale.total ?? 0).toLocaleString()} ·{" "}
                          {sale.buyerEmail ?? sale.userEmail ?? "Guest"}
                        </p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700">
                          {sale.quantity ?? 1} × {sale.ticketType ?? "Admission"}
                          {sale.occurredAt ? (
                            <>
                              <span className="mx-2">·</span>
                              {formatSaleDate(sale.occurredAt)}
                            </>
                          ) : null}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="max-w-full rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl p-4 sm:p-6">
      <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <p className="mt-4 text-2xl sm:text-3xl font-black">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-4 sm:p-6 text-sm text-zinc-500">
      {text}
    </div>
  );
}

function formatSaleDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
