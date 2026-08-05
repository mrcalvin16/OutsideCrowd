"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import NotificationPulse from "@/components/notifications/NotificationPulse";
import { api } from "@/convex/_generated/api";
import { buildIntelligence } from "@/lib/intelligenceEngine";
import MapCanvas from "./components/MapCanvas";
import OrganizerPortalLink from "@/components/OrganizerPortalLink";

const categories = ["All", "Music", "Nightlife", "Festival", "Food", "Networking", "Free"];

export default function MapPage() {
 const events = useQuery(api.events.getMapEvents);
 const [search, setSearch] = useState("");
 const [activeCategory, setActiveCategory] = useState("All");
 const [viewMode, setViewMode] = useState("Universe");

 const filteredEvents = useMemo(() => {
  if (!events) return [];
  let filtered = [...events];
  const term = search.toLowerCase().trim();

  if (term) {
   filtered = filtered.filter((event) =>
    [event.name, event.description, event.location, event.venueName, event.venueAddress, event.city, event.state]
     .filter(Boolean)
     .join(" ")
     .toLowerCase()
     .includes(term)
   );
  }

  if (activeCategory !== "All") {
   if (activeCategory === "Free") {
    filtered = filtered.filter((event) => Number(event.price ?? 0) <= 0);
   } else {
    filtered = filtered.filter((event) =>
     [event.name, event.description, event.location, event.venueName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(activeCategory.toLowerCase())
    );
   }
  }

  return filtered;
 }, [events, search, activeCategory]);

 return (
  <main className="relative h-screen overflow-hidden overflow-x-hidden bg-black text-white">
   <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_72%_72%,rgba(124,58,237,0.18),transparent_35%),linear-gradient(to_bottom,#000,#030303)]">

    <div className="absolute inset-0 opacity-[0.04]">
     <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>

    <div className="absolute left-[14%] top-[22%] h-3 w-3 animate-pulse rounded-full bg-orange-300 shadow-[0_0_22px_rgba(251,146,60,0.85)]" />

    <div className="absolute right-[18%] top-[38%] h-2 w-2 animate-pulse rounded-full bg-violet-300 shadow-[0_0_22px_rgba(167,139,250,0.85)]" />

    <div className="absolute left-[48%] top-[70%] h-2 w-2 animate-pulse rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]" />

    <div className="absolute left-1/2 top-[18%] h-[620px] w-[620px] -translate-x-1/2 rounded-full border border-white/[0.04]" />

    <div className="absolute left-1/2 top-[18%] h-[820px] w-[820px] -translate-x-1/2 rounded-full border border-violet-400/[0.04]" />

    <div className="absolute left-1/2 top-[18%] h-[820px] w-[820px] -translate-x-1/2 rounded-full border border-transparent border-t-orange-300/20 animate-spin [animation-duration:18s]" />

    <div className="absolute left-1/2 top-[42%] h-[70vh] sm:h-[520px] w-full sm:w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[140px]" />

    <div className="absolute left-1/2 top-[42%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px]" />

    <div className="absolute left-1/2 top-[42%] h-[920px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-transparent border-l-violet-300/10 animate-spin [animation-duration:35s]" />
   </div>

   <header className="absolute left-0 right-0 top-0 z-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-5 md:px-8">
    <Link
     href="/"
     className="group relative overflow-hidden rounded-full border border-white/10 bg-black/55 px-5 min-h-11 py-3.5 sm:py-3 text-lg font-black shadow-[0_0_40px_rgba(139,92,246,0.1)] backdrop-blur-2xl transition hover:border-orange-300/35 hover:bg-white/[0.06]"
    >
     <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition group-hover:opacity-100" />
     Outside<span className="bg-gradient-to-r from-orange-400 to-violet-400 bg-clip-text text-transparent">Crowd</span>
    </Link>

    <div className="flex flex-wrap items-center gap-3">
     <Link
      href="/events"
      className="hidden rounded-full border border-white/10 bg-black/55 px-5 min-h-11 py-3.5 sm:py-3 text-sm font-bold text-white/80 shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition hover:border-violet-300/30 hover:bg-white/10 hover:text-white md:block"
     >
      Events
     </Link>

     <Link
      href="/recommendations"
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-3.5 text-sm font-bold text-orange-100 shadow-lg shadow-orange-500/10 transition hover:scale-[1.01] hover:bg-orange-500/20 sm:py-3"
     >
      AI picks
     </Link>


     <OrganizerPortalLink
      className="rounded-full border border-orange-500/30 bg-orange-500/10 px-5 min-h-11 py-3.5 sm:py-3 text-sm font-bold text-orange-100 shadow-[0_0_30px_rgba(249,115,22,0.12)] backdrop-blur-2xl transition hover:bg-orange-500/20"
      organizerLabel="Host"
     />
    </div>
   </header>

   <div className="pointer-events-none absolute left-1/2 top-[92px] z-40 hidden -translate-x-1/2 lg:flex">
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-black/60 px-5 min-h-11 py-3.5 sm:py-3 shadow-[0_0_60px_rgba(139,92,246,0.12)] backdrop-blur-2xl">
     <div className="flex flex-wrap items-center gap-2">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.9)]" />
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
       Network Online
      </span>
     </div>

     <div className="h-4 w-px bg-white/10" />

     <div className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-200">
      {filteredEvents.length} live signals
     </div>

     <div className="h-4 w-px bg-white/10" />

     <div className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-200">
      Discovery Mode: {viewMode}
     </div>
    </div>
   </div>

   <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
    <div className="absolute left-[-20%] top-[38%] h-px w-[140%] bg-gradient-to-r from-transparent via-orange-300/25 to-transparent animate-pulse" />
   </div>

   <section className="absolute left-5 top-24 z-40 w-[calc(100%-40px)] max-w-xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/55 p-5 shadow-[0_0_80px_rgba(139,92,246,0.12)] backdrop-blur-2xl md:left-8 md:top-28 md:p-7">

    <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />

    <div className="pointer-events-none absolute left-[-80px] bottom-[-80px] h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-orange-300">
     Global Event Radar
    </p>

    <h1 className="mt-3 text-2xl sm:text-3xl sm:text-4xl font-black leading-none tracking-[-0.04em] sm:tracking-tight md:text-6xl">
     Find the signal.
    </h1>

    <p className="mt-4 max-w-[calc(100vw-2rem)] sm:max-w-md text-sm leading-6 text-white/55">
     Events appear as live crowd signals around the globe. Hover a pulse, follow a signal, or search the network.
    </p>

    <div className="mt-5 grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-3 gap-3">
     <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
       Signals
      </p>
      <p className="mt-1 text-xl font-black">
       {filteredEvents.length}
      </p>
     </div>

     <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
       Mode
      </p>
      <p className="mt-1 text-xl font-black text-orange-200">
       Live
      </p>
     </div>

     <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
       Network
      </p>
      <p className="mt-1 text-xl font-black text-violet-200">
       Active
      </p>
     </div>
    </div>

    <div className="mt-5 rounded-2xl border border-white/10 bg-black/60 p-2 shadow-[0_0_35px_rgba(249,115,22,0.08)]">
     <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search city, venue, neighborhood, or event..."
      className="w-full rounded-2xl sm:rounded-xl bg-transparent px-4 min-h-11 py-3.5 sm:py-3 text-sm text-white outline-none placeholder:text-white/35"
     />
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-black/55 px-4 min-h-11 py-3.5 sm:py-3">
      <div>
       <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">
        Signal Filter
       </p>
       <p className="mt-1 text-sm font-black text-white">
        {activeCategory}
       </p>
      </div>

      <select
       value={activeCategory}
       onChange={(e) => setActiveCategory(e.target.value)}
       className="rounded-full border border-white/10 bg-white px-4 min-h-11 py-3.5 sm:py-3 sm:py-2 text-sm font-black text-black outline-none"
      >
       {categories.map((category) => (
        <option key={category} value={category}>
         {category}
        </option>
       ))}
      </select>
     </div>

     <button
      onClick={() => {
       setSearch("");
       setActiveCategory("All");
      }}
      className="rounded-2xl border border-orange-500/25 bg-orange-500/10 px-5 min-h-11 py-3.5 sm:py-3 text-sm font-black text-orange-100 hover:bg-orange-500/20"
     >
      Reset Signal
     </button>
    </div>

    <div className="mt-4 flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 pb-1">
     {categories.map((category) => (
      <button
       key={category}
       type="button"
       onClick={() => setActiveCategory(category)}
       className={
        activeCategory === category
         ? "shrink-0 rounded-full border border-orange-300/40 bg-orange-500/20 px-4 min-h-11 py-3.5 sm:py-3 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wide text-orange-100"
         : "shrink-0 rounded-full border border-white/10 bg-black/35 px-4 min-h-11 py-3.5 sm:py-3 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wide text-white/55 hover:border-violet-300/30 hover:text-white"
       }
      >
       {category}
      </button>
     ))}
    </div>\n\n    <div className="mt-4 flex rounded-2xl border border-white/10 bg-black/45 p-1">
     {["Universe", "Nearby", "Tonight"].map((mode) => (
      <button
       key={mode}
       type="button"
       onClick={() => setViewMode(mode)}
       className={
        viewMode === mode
         ? "flex-1 rounded-2xl sm:rounded-xl bg-white px-3 py-3 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wide text-black"
         : "flex-1 rounded-2xl sm:rounded-xl px-3 py-3 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wide text-white/45 hover:text-white"
       }
      >
       {mode}
      </button>
     ))}
    </div>\n\n    <div className="mt-4 space-y-2">
     <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
      Top Signals
     </p>

     <div className="grid gap-2">
      {filteredEvents.slice(0, 3).map((event: any) => (
       <Link
        key={event._id}
        href={`/events/${event._id}`}
        className="group flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-black/35 px-4 min-h-11 py-3.5 sm:py-3 transition hover:border-orange-300/35 hover:bg-white/[0.06]"
       >
        <div className="min-w-0">
         <p className="truncate text-sm font-black text-white">
          {event.name || "Untitled Event"}
         </p>
         <p className="mt-1 truncate text-[11px] sm:text-xs text-white/40">
          {event.city || event.location || "Location pending"}
         </p>
        </div>

        <span className="shrink-0 text-[11px] sm:text-xs font-black text-orange-200 transition group-hover:translate-x-0.5">
         →
        </span>
       </Link>
      ))}

      {filteredEvents.length === 0 && (
       <div className="rounded-2xl border border-white/10 bg-black/35 px-4 min-h-11 py-3.5 sm:py-3 text-sm text-white/45">
        No matching signals.
       </div>
      )}
     </div>
    </div>
    <div className="mt-6 flex justify-end">
     <NotificationPulse />
    </div>
   </section>

   <aside className="pointer-events-auto absolute right-5 top-28 z-40 hidden w-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 p-5 shadow-[0_0_70px_rgba(249,115,22,0.1)] backdrop-blur-2xl xl:block">
    <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

    <div className="relative z-10">
     <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-violet-300/70">
      Discovery Rail
     </p>

     <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:tracking-tight">
      Signal activity
     </h2>

     <div className="mt-5 space-y-3">
      <DiscoveryRailItem
       label="Active Signals"
       value={filteredEvents.length.toLocaleString()}
       detail="Events visible on radar"
      />

      <DiscoveryRailItem
       label="Current Filter"
       value={activeCategory}
       detail={search ? `Searching: ${search}` : "All live signals"}
      />

      <DiscoveryRailItem
       label="Discovery Mode"
       value={viewMode}
       detail="Map-based event browsing"
      />
     </div>

     <div className="mt-5 rounded-2xl border border-orange-300/15 bg-orange-500/10 p-4">
      <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-orange-200/70">
       Crowd Tip
      </p>
      <p className="mt-2 text-sm leading-6 text-white/55">
       Use city, venue, neighborhood, or event keywords to follow the strongest nearby signal.
      </p>
     </div>
    </div>
   </aside>

   <div className="pointer-events-auto absolute bottom-4 sm:bottom-6 left-1/2 z-40 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/60 p-2 shadow-[0_0_60px_rgba(139,92,246,0.14)] backdrop-blur-2xl lg:flex">
    <Link
     href="/events"
     className="rounded-full px-5 min-h-11 py-3.5 sm:py-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white"
    >
     List View
    </Link>

    <OrganizerPortalLink
     className="rounded-full bg-gradient-to-r from-orange-500 to-violet-500 px-5 min-h-11 py-3.5 sm:py-3 text-sm font-black text-white shadow-[0_0_30px_rgba(249,115,22,0.2)]"
     organizerLabel="Create Event"
     organizerHref="/host/create"
    />

    <OrganizerPortalLink
     className="rounded-full px-5 min-h-11 py-3.5 sm:py-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white"
     organizerLabel="Organizer OS"
    />
   </div>

   <div className="pointer-events-auto absolute bottom-4 sm:bottom-6 left-8 z-40 hidden rounded-[1.5rem] border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-2xl lg:block">
    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
     Signal Legend
    </p>

    <div className="mt-3 grid gap-2 text-[11px] sm:text-xs font-bold text-white/65">
     <div className="flex flex-wrap items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-orange-300 shadow-[0_0_14px_rgba(251,146,60,.9)]" />
      Live event signal
     </div>

     <div className="flex flex-wrap items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(167,139,250,.9)]" />
      Discovery cluster
     </div>

     <div className="flex flex-wrap items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,.8)]" />
      Active city pulse
     </div>
    </div>
   </div>

   <div className="pointer-events-auto absolute inset-x-4 bottom-5 z-40 rounded-[1.75rem] border border-white/10 bg-black/70 p-4 shadow-[0_-20px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl xl:hidden">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between gap-4">
     <div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300/70">
       Live Radar
      </p>
      <p className="mt-1 text-2xl font-black">
       {filteredEvents.length} signals
      </p>
     </div>

     <Link
      href="/events"
      className="rounded-2xl bg-gradient-to-r from-orange-500 to-violet-500 px-5 min-h-11 py-3.5 sm:py-3 text-sm font-black text-white shadow-[0_0_30px_rgba(249,115,22,0.2)]"
     >
      List View
     </Link>
    </div>
   </div>

   {events === undefined ? (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-white/50">
     <div className="h-16 w-16 rounded-full border border-orange-300/20 border-t-orange-300 animate-spin" />

     <div className="text-center">
      <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-orange-200/70">
       OutsideCrowd Universe
      </p>

      <p className="mt-3 text-sm text-white/50">
       Loading global event radar...
      </p>
     </div>
    </div>
   ) : (
    <MapCanvas events={filteredEvents} />
   )}
   <div className="h-10 sm:hidden" />
  </main>
 );
}

function DiscoveryRailItem({
 label,
 value,
 detail,
}: {
 label: string;
 value: string;
 detail: string;
}) {
 return (
  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-orange-300/30 hover:bg-white/[0.05]">
   <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
    {label}
   </p>
   <p className="mt-2 truncate text-2xl font-black text-white">
    {value}
   </p>
   <p className="mt-1 line-clamp-2 text-[11px] sm:text-xs leading-5 text-white/45">
    {detail}
   </p>
  </div>
 );
}
