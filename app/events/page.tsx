"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MapCanvas from "../map/components/MapCanvas";

function getDiscoveryLabel(event: any) {
  const sold = event.ticketsSold ?? 0;
  const total = event.totalTickets ?? 0;
  const ratio = total ? sold / total : 0;

  if (event.isPromoted && (!event.promotionEndsAt || event.promotionEndsAt > Date.now())) {
    return "Organizer Spotlight";
  }

  if (ratio >= 0.7) return "Selling Fast";
  if (sold >= 25) return "Trending";
  if (sold >= 10) return "Popular Near You";

  return event.category || "Live Event";
}

function getDiscoveryScore(event: any) {
  const sold = event.ticketsSold ?? 0;
  const total = event.totalTickets ?? 0;
  const ratio = total ? sold / total : 0;
  const promotedBoost =
    event.isPromoted && (!event.promotionEndsAt || event.promotionEndsAt > Date.now())
      ? 50
      : 0;

  return promotedBoost + sold * 2 + Math.round(ratio * 100);
}

function EventImage({ storageId }: { storageId?: Id<"_storage"> }) {
  const imageUrl = useQuery(
    api.events.getImageUrl,
    storageId ? { storageId } : "skip"
  );

  if (!storageId) {
    return (
      <div className="flex h-56 items-center justify-center bg-zinc-900 text-zinc-500">
        No Image
      </div>
    );
  }

  if (imageUrl === undefined) {
    return (
      <div className="flex h-56 items-center justify-center bg-zinc-900 text-zinc-500">
        Loading image...
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex h-56 items-center justify-center bg-zinc-900 text-zinc-500">
        Image unavailable
      </div>
    );
  }

  return (
    <div className="relative h-56 w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt="Event image"
        fill
        className="object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
  );
}

function FeaturedOrganizerCard({
  userId,
  eventCount,
}: {
  userId: string;
  eventCount: number;
}) {
  const data = useQuery(api.organizers.getOrganizerByUserId, { userId });

  const organizer = data?.organizer;

  const displayName =
    organizer?.organizerName || organizer?.name || "Featured Organizer";

  return (
    <Link
      href={`/organizers/${userId}`}
      className="min-w-[260px] rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition duration-500 hover:-translate-y-2 hover:shadow-[0_0_45px_rgba(139,92,246,0.18)] hover:border-violet-400/50 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 text-2xl font-black text-white">
          {organizer?.avatarUrl ? (
            <img
              src={organizer.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 font-bold">{displayName}</h3>

            {organizer?.isVerifiedOrganizer && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-black text-white">
                ✓ Verified
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {eventCount} event{eventCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-zinc-400">
        {organizer?.bio || "Hosting local experiences on OutsideCrowd."}
      </p>

      <div className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
        View Profile
      </div>
    </Link>
  );
}



function OrganizerOrb({ userId, eventCount }: { userId: string; eventCount: number }) {
  const data = useQuery(api.organizers.getOrganizerByUserId, { userId });

  const organizer = data?.organizer;

  const displayName =
    organizer?.organizerName || organizer?.name || "Host";

  return (
    <Link
      href={`/organizers/${userId}`}
      className="group flex min-w-[110px] flex-col items-center text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-violet-300/30 bg-black text-2xl font-black text-white shadow-[0_0_35px_rgba(139,92,246,0.18)] transition group-hover:scale-105 group-hover:border-violet-300">
        {organizer?.avatarUrl ? (
          <img
            src={organizer.avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>

      <p className="mt-3 line-clamp-1 text-sm font-bold text-white">
        {displayName}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {eventCount} events
      </p>
    </Link>
  );
}

function OrganizerName({ userId }: { userId: string }) {
  const data = useQuery(api.organizers.getOrganizerByUserId, { userId });

  const organizer = data?.organizer;

  const displayName =
    organizer?.organizerName || organizer?.name || "Organizer";

  return <span>Hosted by {displayName}</span>;
}


export default function EventsPage() {
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [view, setView] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All Cities");

  const events = useQuery(api.events.getAll, {});
  const myEvents = useQuery(api.events.getMyEvents);

  const savedEventIds =
    useQuery(api.savedEvents.getSavedEventIds) || [];

  const toggleSaved =
    useMutation(api.savedEvents.toggleSavedEvent);


  const organizerStats = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of events ?? []) {
      const organizerKey = event.organizerId || event.userId;
      if (!organizerKey) continue;
      counts.set(organizerKey, (counts.get(organizerKey) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 6);
  }, [events]);

  const displayedEvents = useMemo(() => {
    const baseEvents = view === "mine" ? myEvents ?? [] : events ?? [];

    let filtered = baseEvents;

    if (category !== "All") {
      filtered = filtered.filter((event) => {
        const storedCategory = event.category?.toLowerCase();

        if (storedCategory) {
          return storedCategory === category.toLowerCase();
        }

        const text = `
          ${event.name || ""}
          ${event.description || ""}
        `.toLowerCase();

        return text.includes(category.toLowerCase());
      });
    }

    if (city !== "All Cities") {
      filtered = filtered.filter((event) => {
        const text = `
          ${event.location || ""}
          ${event.name || ""}
          ${event.description || ""}
        `.toLowerCase();

        return text.includes(city.toLowerCase());
      });
    }

    const ranked = [...filtered].sort((a, b) => {
      const now = Date.now();
      const aPromoted = a.isPromoted && (!a.promotionEndsAt || a.promotionEndsAt > now) ? 1 : 0;
      const bPromoted = b.isPromoted && (!b.promotionEndsAt || b.promotionEndsAt > now) ? 1 : 0;

      if (aPromoted !== bPromoted) return bPromoted - aPromoted;

      const aWeight = a.featuredWeight ?? 0;
      const bWeight = b.featuredWeight ?? 0;

      if (aWeight !== bWeight) return bWeight - aWeight;

      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

    if (!search.trim()) return ranked;

    const q = search.toLowerCase();

    return ranked.filter((event) => {
      return (
        event.name?.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q) ||
        event.dateString?.toLowerCase().includes(q)
      );
    });
  }, [view, events, myEvents, search, category, city]);

  async function toggleSavedEvent(eventId: string) {
    try {
      await toggleSaved({
        eventId: eventId as any,
      });
    } catch (error) {
      console.error("Failed to toggle saved event:", error);
    }
  }

  if (events === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-lg">Loading events...</div>
      </main>
    );
  }

  return (
    <main className="safe-x min-h-screen overflow-x-hidden bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/events"
            className="shrink-0 text-2xl font-extrabold tracking-[0.02em] sm:text-2xl sm:text-3xl"
          >
            <span className="text-white">OUTSIDE</span>
            <span className="text-violet-500">CROWD</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/events" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                Events
              </Link>

              <Link href="/map" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                Map
              </Link>

              <SignedOut>
                <Link href="/explore" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                  Explore
                </Link>

                <Link href="/cities" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                  Cities
                </Link>

                <SignInButton mode="modal">
                  <button className="rounded-full border border-orange-400/40 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-violet-500/10">
                    Become a Host
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link href="/saved-events" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                  Saved
                </Link>

                <Link prefetch={false} href="/my-tickets" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                  My Tickets
                </Link>

                <Link prefetch={false} href="/host" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white">
                  Host Dashboard
                </Link>
              </SignedIn>
            </div>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black sm:px-5">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/events" />
            </SignedIn>
          </div>
        </div>

        <div className="border-t border-zinc-900 px-4 py-3 md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <Link href="/events" className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              Events
            </Link>

            <Link href="/map" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white">
              Map
            </Link>

            <SignedOut>
              <Link href="/explore" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white">
                Explore
              </Link>

              <Link href="/cities" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white">
                Cities
              </Link>

              <SignInButton mode="modal">
                <button className="shrink-0 rounded-full bg-violet-500 px-4 py-2 text-sm font-black text-black">
                  Become a Host
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link href="/saved-events" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white">
                Saved
              </Link>

              <Link prefetch={false} href="/my-tickets" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white">
                My Tickets
              </Link>

              <Link prefetch={false} href="/host" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white">
                Host
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      <section className="border-b border-zinc-900 bg-[radial-gradient(circle_at_top,#f9731630,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed35,transparent_35%)]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-400">
            Discover Experiences
          </p>

          <h1 className="max-w-4xl text-2xl sm:text-3xl sm:text-5xl font-black leading-tight md:text-7xl">
            Find your next event.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Search concerts, festivals, nightlife, pop-ups, networking events,
            and local experiences.
          </p>

          <div className="mt-8 max-w-3xl rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl/90 p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event, city, venue, or date..."
              className="w-full rounded-2xl bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "All",
              "Concert",
              "Reunion",
              "Conference",
              "Party",
              "Religious",
              "Festival",
              "Food",
              "Networking",
              "Sports",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "bg-white text-black"
                    : "border border-zinc-700 text-white hover:border-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              "All Cities",
              "New Orleans",
              "Baton Rouge",
              "Houston",
              "Atlanta",
              "Slidell",
              "Algiers",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setCity(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  city === item
                    ? "bg-violet-500 text-black"
                    : "border border-zinc-700 text-white hover:border-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setView("all")}
              className={`rounded-full px-5 py-2 text-sm font-medium ${
                view === "all"
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-white hover:border-white"
              }`}
            >
              All Events
            </button>

            <button
              onClick={() => setView("mine")}
              className={`rounded-full px-5 py-2 text-sm font-medium ${
                view === "mine"
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-white hover:border-white"
              }`}
            >
              My Events
            </button>

            <Link
              href="/host/create"
              className="rounded-full bg-violet-500 px-5 py-2 text-sm font-black text-black hover:bg-violet-400"
            >
              Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED ORGANIZER ORBS */}
      {organizerStats.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                  Featured Hosts
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Organizers shaping the crowd.
                </h2>
              </div>
            </div>

            <div className="flex gap-4 sm:p-6 overflow-x-auto pb-2">
              {organizerStats.slice(0, 8).map((organizer) => (
                <OrganizerOrb
                  key={organizer.userId}
                  userId={organizer.userId}
                  eventCount={organizer.eventCount}
                />
              ))}
            </div>
          </div>
        </section>

      )}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-[2.2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black">
          <div className="grid gap-4 sm:p-6 lg:grid-cols-[1fr_360px]">
            <div className="p-5 sm:p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Explore By Area
              </p>

              <h2 className="mt-3 text-2xl sm:text-3xl sm:text-4xl font-black leading-tight">
                Discover events through the live city map.
              </h2>

              <p className="mt-5 max-w-2xl text-zinc-400">
                Browse venues, neighborhoods, and experiences happening around
                you.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/map"
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200"
                >
                  Open Map View
                </Link>

                <div className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300">
                  {displayedEvents.length} experiences
                </div>
              </div>
            </div>

            
<div className="relative min-h-[320px] overflow-hidden border-l border-zinc-800 bg-black">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.14),transparent_26%)]" />

  <div className="absolute inset-0 opacity-30">
    <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:42px_42px]" />
  </div>

  <div className="absolute left-[24%] top-[28%] h-4 w-4 rounded-full bg-orange-400 shadow-[0_0_28px_rgba(249,115,22,0.9)]" />
  <div className="absolute left-[60%] top-[38%] h-4 w-4 rounded-full bg-white shadow-[0_0_28px_rgba(255,255,255,0.7)]" />
  <div className="absolute left-[42%] top-[66%] h-4 w-4 rounded-full bg-orange-400 shadow-[0_0_28px_rgba(249,115,22,0.9)]" />

  <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-black/80 p-5 backdrop-blur-md-xl">
    <p className="text-sm font-black text-white">
      OutsideCrowd Live Map
    </p>

    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
      Open the full map to explore venues, neighborhoods, and events.
    </p>

    <Link
      href="/map"
      className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-xs font-black text-black hover:bg-zinc-200"
    >
      Open Full Map
    </Link>
  </div>
</div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      {displayedEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                Featured Experiences
              </p>

              <h2 className="mt-2 text-2xl sm:text-3xl sm:text-4xl font-black leading-tight">
                Premium nightlife, festivals & culture.
              </h2>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Discover curated events trending across the OutsideCrowd network.
              </p>
            </div>

            <Link
              href="/events"
              className="hidden rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-white md:inline-flex"
            >
              View All
            </Link>
          </div>

          <div className="flex gap-4 sm:p-6 overflow-x-auto pb-4">
            {[...displayedEvents]
              .sort((a, b) => {
                const now = Date.now();
                const aPromoted = a.isPromoted && (!a.promotionEndsAt || a.promotionEndsAt > now) ? 1 : 0;
                const bPromoted = b.isPromoted && (!b.promotionEndsAt || b.promotionEndsAt > now) ? 1 : 0;

                if (aPromoted !== bPromoted) {
                  return bPromoted - aPromoted;
                }

                const aWeight = a.featuredWeight ?? 0;
                const bWeight = b.featuredWeight ?? 0;

                if (aWeight !== bWeight) {
                  return bWeight - aWeight;
                }

                return (b.ticketsSold ?? 0) - (a.ticketsSold ?? 0);
              })
              .slice(0, 6)
              .map((event) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="group relative min-w-[340px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_0_45px_rgba(139,92,246,0.18)] hover:border-violet-400/50"
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute left-5 top-5 z-20 flex flex-wrap gap-2">
                  <div className="rounded-full bg-violet-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[0_0_25px_rgba(249,115,22,0.55)]">
                    Featured
                  </div>

                  {event.isPromoted && (!event.promotionEndsAt || event.promotionEndsAt > Date.now()) && (
                    <div className="rounded-full border border-white/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
                      Promoted
                    </div>
                  )}
                </div>

                <div className="h-[440px] overflow-hidden">
                  <EventImage storageId={event.imageStorageId} />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs uppercase tracking-wide text-white backdrop-blur-md">
                      {event.category || "Experience"}
                    </span>

                    {(event.ticketsSold ?? 0) >= 10 && (
                      <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                        Trending
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-2xl sm:text-3xl font-black leading-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                    {event.name}
                  </h3>

                  <p className="mt-3 text-sm text-zinc-300">
                    {event.location}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Tickets Sold
                      </p>

                      <p className="font-bold text-white">
                        {event.ticketsSold ?? 0}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Starting At
                      </p>

                      <p className="text-2xl font-black text-white">
                        ${event.price ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-white"
                      style={{
                        width: `${
                          event.totalTickets
                            ? Math.min(
                                100,
                                Math.round(
                                  ((event.ticketsSold ?? 0) /
                                    event.totalTickets) *
                                    100
                                )
                              )
                            : 25
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}


            <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
              Browse Events
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black">
              {view === "mine" ? "My Events" : "Trending Events"}
            </h2>
          </div>

          <p className="text-sm text-zinc-500">
            Showing {displayedEvents.length} event
            {displayedEvents.length === 1 ? "" : "s"}
          </p>
        </div>

        {displayedEvents.length === 0 ? (
          <div className="rounded-[1.5rem] sm:rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 p-16 text-center">
            <h2 className="text-2xl font-bold">No events found</h2>

            <p className="mt-3 text-zinc-500">
              Try another search or create your first event.
            </p>

            <Link
              href="/host/create"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:p-6 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 lg:grid-cols-3">
            {displayedEvents.map((event) => (
              <div
                key={event._id}
                className={
                  event.isPromoted && (!event.promotionEndsAt || event.promotionEndsAt > Date.now())
                    ? "group relative overflow-hidden rounded-[2rem] border border-orange-400/40 bg-zinc-950/90 shadow-[0_0_55px_rgba(249,115,22,0.12)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_0_65px_rgba(139,92,246,0.20)] hover:border-orange-300"
                    : "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl/90 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_0_65px_rgba(139,92,246,0.20)] hover:border-violet-400/50"
                }
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                  <div className="absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                </div>

                <Link href={`/events/${event._id}`}>
                  <EventImage storageId={event.imageStorageId} />
                </Link>

                <div className="relative p-5 sm:p-7">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400">
                        {getDiscoveryLabel(event)}
                      </span>

                      {(event.ticketsSold ?? 0) >= 10 && (
                        <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                          Popular Near You
                        </span>
                      )}

                      {event.totalTickets &&
                        (event.ticketsSold ?? 0) / event.totalTickets >= 0.7 && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                            Selling Fast
                          </span>
                        )}
                    </div>

                    <span className="text-sm text-zinc-500">
                      {event.dateString}
                    </span>
                  </div>

                  <Link href={`/events/${event._id}`}>
                    <h2 className="line-clamp-2 text-2xl sm:text-3xl font-black tracking-tight transition hover:text-zinc-200">
                      {event.name}
                    </h2>
                  </Link>

                  {(event.organizerId || event.userId) && (
                    <Link
                      href={`/organizers/${event.organizerId || event.userId}`}
                      className="mt-2 inline-flex text-sm font-semibold text-violet-400 hover:text-orange-300"
                    >
                      <OrganizerName userId={event.organizerId || event.userId} />
                    </Link>
                  )}

                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {event.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between gap-4 sm:p-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Location
                      </p>
                      <p className="text-sm font-medium">{event.location}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Price
                      </p>
                      <p className="text-lg font-bold">
                        ${event.price ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-4 border-t border-zinc-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Tickets Sold
                      </p>
                      <p className="font-semibold">
                        {event.ticketsSold ?? 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSavedEvent(event._id)}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                          savedEventIds.includes(event._id)
                            ? "bg-violet-500 text-black"
                            : "border border-zinc-700 text-white hover:border-white"
                        }`}
                      >
                        {savedEventIds.includes(event._id) ? "Saved" : "♡ Save"}
                      </button>

                      <Link
                        href={`/events/${event._id}`}
                        className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.03] hover:bg-zinc-200"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function DiscoveryCollection({
  collectionKey,
  activeCollection,
  onSelect,
  title,
  subtitle,
}: {
  collectionKey: string;
  activeCollection: string;
  onSelect: (value: string) => void;
  title: string;
  subtitle: string;
}) {
  const isActive = activeCollection === collectionKey;

  return (
    <button
      type="button"
      onClick={() => onSelect(isActive ? "all" : collectionKey)}
      className={`group relative overflow-hidden rounded-[2rem] border p-4 sm:p-6 text-left shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${
        isActive
          ? "border-violet-300/50 bg-violet-500/15"
          : "border-white/10 bg-white/[0.04] hover:border-violet-400/40"
      }`}
    >
      <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full bg-violet-500/20 blur-3xl transition group-hover:bg-orange-500/20" />

      <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300/70">
        Collection
      </p>

      <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-white/55">
        {subtitle}
      </p>

      <div className="mt-5 text-sm font-black text-violet-200 transition group-hover:text-white">
        {isActive ? "Viewing Collection" : "Explore →"}
      </div>
    </button>
  );
}
