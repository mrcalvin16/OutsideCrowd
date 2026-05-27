"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type MapEvent = {
  _id: string;
  name?: string;
  location?: string;
  venueName?: string;
  city?: string;
  state?: string;
  price?: number;
  ticketsSold?: number;
};

export default function MapCanvas({ events = [] }: { events: MapEvent[] }) {
  const [mode, setMode] = useState<"global" | "trending" | "tonight" | "weekend">("global");

  const nodes = useMemo(() => {
    const positions = [
      { x: 50, y: 18 },
      { x: 71, y: 28 },
      { x: 82, y: 49 },
      { x: 70, y: 70 },
      { x: 51, y: 80 },
      { x: 30, y: 70 },
      { x: 18, y: 50 },
      { x: 28, y: 29 },
      { x: 50, y: 50 },
      { x: 61, y: 39 },
    ];

    return events.map((event, index) => ({
      ...event,
      ...positions[index % positions.length],
      delay: `${index * 0.18}s`,
    }));
  }, [events]);

  const totalCrowd = events.reduce((sum, event) => sum + Number(event.ticketsSold ?? 0), 0);
  const displayCrowd = totalCrowd || events.length * 31;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(249,115,22,0.20),transparent_28%),radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.16),transparent_40%)]" />

      <div className="absolute inset-0 opacity-[0.14]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:76px_76px]" />
      </div>

      <div className="absolute left-1/2 top-[54%] h-[min(76vw,720px)] w-[min(76vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_34%_26%,rgba(255,255,255,0.24),rgba(249,115,22,0.18)_24%,rgba(124,58,237,0.14)_52%,rgba(2,2,2,0.9)_100%)] shadow-[inset_-70px_-80px_130px_rgba(0,0,0,0.82),0_0_150px_rgba(249,115,22,0.25)]" />

      <div className="absolute left-1/2 top-[54%] h-[min(76vw,720px)] w-[min(76vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-25">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="absolute left-1/2 top-[54%] h-[min(88vw,840px)] w-[min(88vw,840px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/10" />
      <div className="absolute left-1/2 top-[54%] h-[min(101vw,970px)] w-[min(101vw,970px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/10" />
      <div className="absolute left-1/2 top-[54%] h-[min(114vw,1080px)] w-[min(114vw,1080px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

      <div className="absolute bottom-7 left-7 z-30 rounded-[2rem] border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-white/40">Crowd Index</p>
        <p className="mt-1 text-5xl font-black text-white">{displayCrowd}</p>
        <p className="text-sm font-bold text-orange-300">{events.length} active event signals</p>
      </div>

      <div className="absolute right-7 top-[38%] z-30 hidden w-52 rounded-[2rem] border border-white/10 bg-black/55 p-5 backdrop-blur-xl xl:block">
        <p className="text-xs uppercase tracking-[0.25em] text-white/35">Hottest Zone</p>
        <p className="mt-2 text-2xl font-black text-white">New Orleans</p>
        <p className="mt-2 text-sm text-white/45">Nightlife and cultural signals are trending upward.</p>
      </div>

      {["NOLA", "ATL", "HOU", "MIA", "NYC", "LA", "CHI", "DC"].map((city, i) => (
        <div
          key={city}
          className="absolute z-10 rounded-full border border-white/5 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/25 backdrop-blur"
          style={{
            left: `${[21, 68, 79, 61, 32, 43, 56, 74][i]}%`,
            top: `${[64, 22, 59, 78, 28, 84, 25, 43][i]}%`,
          }}
        >
          {city}
        </div>
      ))}

      {nodes.map((event, index) => {
        const sold = Number(event.ticketsSold ?? 0);
        const size = sold > 50 ? 32 : sold > 15 ? 25 : 20;

        return (
          <Link
            key={event._id}
            href={`/events/${event._id}`}
            className="group absolute z-40 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${event.x}%`, top: `${event.y}%` }}
          >
            <div className="relative">
              <div className="absolute -inset-5 animate-ping rounded-full bg-orange-500/25" style={{ animationDelay: event.delay }} />
              <div className="absolute -inset-9 rounded-full bg-orange-500/20 blur-2xl group-hover:bg-violet-500/40" />
              <div
                className="relative rounded-full border-2 border-black bg-orange-300 shadow-[0_0_40px_rgba(249,115,22,0.95)] transition group-hover:scale-125 group-hover:bg-violet-300"
                style={{ height: size, width: size }}
              />

              <div className="pointer-events-none absolute left-1/2 top-10 hidden w-72 -translate-x-1/2 rounded-3xl border border-white/10 bg-black/90 p-4 text-left shadow-2xl backdrop-blur-xl group-hover:block">
                <p className="line-clamp-1 text-sm font-black text-white">
                  {event.name || `Event ${index + 1}`}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                  {event.venueName || event.location || "Venue pending"}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 font-bold text-orange-200">
                    {sold || "New"} going
                  </span>
                  <span className="font-bold text-white">Open Event →</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      <div className="absolute bottom-7 left-1/2 z-50 flex max-w-[92%] -translate-x-1/2 gap-3 overflow-x-auto rounded-3xl border border-white/10 bg-black/75 p-3 backdrop-blur-xl">
        {[
          ["global", "🌎 Global"],
          ["trending", "🔥 Trending"],
          ["tonight", "🌙 Tonight"],
          ["weekend", "🎉 Weekend"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key as any)}
            className={`shrink-0 rounded-2xl px-6 py-3 text-sm font-black transition ${
              mode === key
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
