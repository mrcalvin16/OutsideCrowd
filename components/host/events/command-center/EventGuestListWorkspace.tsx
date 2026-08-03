"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  CheckCircle2,
  Clock3,
  Search,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useEventCommandCenter } from "./EventCommandCenter";

type GuestFilter = "all" | "checked-in" | "awaiting";

export default function EventGuestListWorkspace() {
  const { event } = useEventCommandCenter();
  const tickets = useQuery(api.tickets.getTicketsByEvent, {
    eventId: event._id,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GuestFilter>("all");

  const summary = useMemo(() => {
    const all = tickets ?? [];
    const checkedIn = all.filter((ticket) => ticket.checkedIn).length;

    return {
      total: all.length,
      checkedIn,
      awaiting: all.length - checkedIn,
    };
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (tickets ?? []).filter((ticket) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "checked-in" && ticket.checkedIn) ||
        (filter === "awaiting" && !ticket.checkedIn);
      const matchesSearch =
        !query ||
        ticket.buyerName?.toLowerCase().includes(query) ||
        ticket.buyerEmail?.toLowerCase().includes(query) ||
        ticket.ticketTypeName?.toLowerCase().includes(query) ||
        String(ticket.userId).toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, tickets]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
            Attendee operations
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Guest List
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Find attendees, review ticket types, and monitor arrivals.
          </p>
        </div>

        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-400">
          {visibleTickets.length} shown
        </div>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total guests" value={summary.total} icon={Users} />
        <SummaryCard
          label="Checked in"
          value={summary.checkedIn}
          icon={CheckCircle2}
          accent="text-emerald-400"
        />
        <SummaryCard
          label="Awaiting arrival"
          value={summary.awaiting}
          icon={Clock3}
          accent="text-orange-400"
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or ticket type"
              className="min-h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-zinc-700 focus:border-orange-400/40"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto">
            {(["all", "checked-in", "awaiting"] as GuestFilter[]).map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-xs font-black capitalize transition ${
                    filter === option
                      ? "bg-white text-black"
                      : "border border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:text-white"
                  }`}
                >
                  {option.replace("-", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {tickets === undefined ? (
          <GuestListLoading />
        ) : visibleTickets.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <UserRound className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="mt-4 text-sm font-black">No guests found</p>
            <p className="mt-1 text-xs text-zinc-600">
              Try another search or attendance filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {visibleTickets.map((ticket) => (
              <article
                key={ticket._id}
                className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.025] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-sm font-black text-orange-300">
                    {getInitials(ticket.buyerName, ticket.buyerEmail)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {ticket.buyerName || "Guest"}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-600">
                      {ticket.buyerEmail || String(ticket.userId)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-[10px] font-black text-zinc-400">
                    <Ticket className="h-3 w-3" />
                    {ticket.ticketTypeName || "General Admission"}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
                      ticket.checkedIn
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-orange-400/20 bg-orange-400/10 text-orange-300"
                    }`}
                  >
                    {ticket.checkedIn ? "Checked in" : "Awaiting"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent = "text-violet-400",
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-zinc-500">{label}</p>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function GuestListLoading() {
  return (
    <div className="animate-pulse divide-y divide-white/[0.05]">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center gap-3 px-5 py-4">
          <div className="h-11 w-11 rounded-2xl bg-white/[0.05]" />
          <div className="flex-1">
            <div className="h-3 w-40 rounded bg-white/[0.06]" />
            <div className="mt-2 h-2.5 w-56 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "Guest";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
