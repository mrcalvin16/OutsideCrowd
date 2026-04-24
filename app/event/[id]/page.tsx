
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { useStorageUrl } from "@/lib/utils";
import { useMutation } from "convex/react"; "@/lib/utils";

export default function EventPage() {
  const joinEvent = useMutation(api.events.joinWaitingList);
  const params = useParams();

  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative h-[55vh] min-h-[420px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={event.name} fill className="object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-10">
          <h1 className="text-5xl lg:text-7xl font-black">{event.name}</h1>
          <p className="text-zinc-300 mt-3 text-lg max-w-2xl">
            {event.description}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_350px] gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card icon={<CalendarDays />} label="Date" value={new Date(event.eventDate).toLocaleDateString()} />
            <Card icon={<MapPin />} label="Location" value={event.location} />
            <Card icon={<Users />} label="Tickets" value={`${event.totalTickets}`} />
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">About this event</h2>
            <p className="text-zinc-400">{event.description}</p>
          </div>
        </div>

        {/* RIGHT (CTA) */}
        <aside className="bg-zinc-900 border border-white/10 rounded-2xl p-6 h-fit sticky top-6">
          <p className="text-zinc-400 text-sm">Price</p>
          <p className="text-4xl font-black mt-1">${event.price}</p>

          <button onClick={() => joinEvent({ eventId: params.id })} className="mt-6 w-full bg-red-600/90 hover:bg-red-600 shadow-lg shadow-red-900/30 transition py-4 rounded-xl font-bold">
            {availability?.available === false ? "Sold Out" : "Join Event"}
          </button>

          <p className="text-xs text-zinc-500 mt-4 flex items-center gap-2">
            <Ticket size={14} /> Secure checkout coming soon
      <div className="mt-6 bg-zinc-900 border border-white/10 rounded-xl p-4">
        <p className="text-sm text-zinc-400 mb-2">
          {availability?.purchasedCount ?? 0} attending
        </p>
        <div className="flex -space-x-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-xs font-bold">
              {i}
            </div>
          ))}
        </div>
      </div>

          </p>
        </aside>
      </section>
    </main>
  );
}

function Card({ icon, label, value }: any) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
      <div className="text-red-500 mb-2">{icon}</div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
