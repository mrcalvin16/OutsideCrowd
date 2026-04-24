"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EventList from "@/components/EventList";
import { Search, Sparkles } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const events = useQuery(api.events.get);

  const filtered = events?.filter((e: any) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category ? e.category === category : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(127,29,29,0.25),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300 mb-6">
            <Sparkles size={16} />
            Your city. Your crowd. Your moment.
          </div>

          <h1 className="max-w-4xl text-5xl md:text-7xl font-black tracking-tight">
            Discover what’s happening outside.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-zinc-400">
            Find parties, concerts, festivals, reunions, pop-ups, and local events built for the people who actually show up.
          </p>

          <div className="mt-8 max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/80 p-3 shadow-2xl shadow-red-950/20">
            <div className="flex items-center gap-3">
              <Search className="ml-3 text-red-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, venues, cities..."
                className="w-full bg-transparent px-2 py-4 text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            {["All", "Party", "Concert", "Festival", "Reunion", "Pop-up"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === "All" ? "" : c)}
                className={`px-5 py-3 rounded-full font-bold transition ${
                  (category === "" && c === "All") || category === c
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                    : "bg-zinc-900 text-zinc-300 border border-white/10 hover:border-red-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-red-500 font-bold uppercase text-sm tracking-wide">OutsideCrowd</p>
            <h2 className="text-3xl font-black">Featured Events</h2>
          </div>
          <p className="text-zinc-500 text-sm">{filtered?.length || 0} events</p>
        </div>

        <EventList events={filtered || []} />
      </section>
    </main>
  );
}
