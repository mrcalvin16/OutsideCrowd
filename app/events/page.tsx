"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EventImage from "./components/EventImage";
import OrganizerOrb from "./components/OrganizerOrb";
import EventGrid from "./components/EventGrid";
import FeaturedHosts from "./components/FeaturedHosts";
import DiscoveryCollections from "./components/DiscoveryCollections";
import LiveMapSection from "./components/LiveMapSection";
import TrendingCarousel from "./components/TrendingCarousel";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import OrganizerPortalLink from "@/components/OrganizerPortalLink";
import { buildIntelligence } from "@/lib/intelligenceEngine";
import { Id } from "@/convex/_generated/dataModel";
import MapCanvas from "../map/components/MapCanvas";
import ExperienceHero from "./components/ExperienceHero";

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
  
      <footer className="border-t border-zinc-900 px-6 py-10 text-center text-sm text-zinc-500">
        <p className="font-black tracking-[0.25em] text-white">
          OUTSIDE<span className="text-violet-500">CROWD</span>
        </p>

        <p className="mt-4">
          © 2026 OutsideCrowd. All rights reserved.
        </p>
      </footer>

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

          <Link
            href="/recommendations"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-3.5 text-sm font-bold text-orange-100 shadow-lg shadow-orange-500/10 transition hover:scale-[1.01] hover:bg-orange-500/20 sm:py-3"
          >
            AI picks
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

                <OrganizerPortalLink className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-white" />
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

              <OrganizerPortalLink organizerLabel="Host" className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-white" />
            </SignedIn>
          </div>
        </div>
      </nav>

      
      <ExperienceHero
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        city={city}
        setCity={setCity}
        view={view}
        setView={setView}
        totalEvents={displayedEvents.length}
      />


      {/* DISCOVERY PHASE 2 */}
      {displayedEvents.length > 0 && (
        <TrendingCarousel
        city={city}
        events={displayedEvents}
        savedEventIds={savedEventIds}
        onToggleSave={toggleSavedEvent}
        getDiscoveryScore={getDiscoveryScore}
      />
      )}

      <DiscoveryCollections
        activeCollection={activeCollection}
        onSelect={setActiveCollection}
      />

      <LiveMapSection
        nearbyCount={displayedEvents.length}
      />

            <FeaturedHosts
        organizerStats={organizerStats}
      />

      <EventGrid
        events={displayedEvents}
        savedEventIds={savedEventIds}
        onToggleSave={toggleSavedEvent}
      />

    </main>
  );
}
