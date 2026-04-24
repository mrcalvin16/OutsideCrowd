"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

export default function EventPage() {
  const params = useParams();
  const { user } = useUser();
  const { toast } = useToast();

  const eventId = params.id as Id<"events">;

  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const joinEvent = useMutation(api.events.joinWaitingList);

  const existing = useQuery(
    api.tickets.getUserTicketForEvent,
    user ? { eventId, userId: user.id } : "skip"
  );

  const existingWaitlist = useQuery(
    api.waitingList.getQueuePosition,
    user ? { eventId, userId: user.id } : "skip"
  );
  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-[55vh] min-h-[420px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={event.name} fill className="object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-10">
          <span className="bg-red-600 text-xs px-3 py-1 rounded-full font-bold">{event.category || "Event"}</span>
          <h1 className="text-5xl lg:text-7xl font-black mt-3">{event.name}</h1>
          <p className="text-zinc-300 mt-3 text-lg max-w-2xl">{event.description}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Info icon={<CalendarDays />} label="Date" value={new Date(event.eventDate).toLocaleDateString()} />
            <Info icon={<MapPin />} label="Location" value={event.location} />
            <Info icon={<Users />} label="Tickets" value={`${availability?.remainingTickets ?? 0} left`} />
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">About this event</h2>
            <p className="text-zinc-400">{event.description}</p>
          </div>
        </div>

        <aside className="bg-zinc-900 border border-white/10 rounded-2xl p-6 h-fit sticky top-6">
          <p className="text-zinc-400 text-sm">Price</p>
          <p className="text-4xl font-black mt-1">${event.price}</p>

          <button
            onClick={async () => {
              if (!user) return toast({ title: "Sign in required", description: "Please sign in to join events." });
              if (existing || existingWaitlist) return toast({ title: "Already joined", description: "This event is already in your tickets." });
              if (availability?.isSoldOut === true) return toast({ title: "Sold out", description: "No tickets are available." });
              if (!availability?.isSoldOut !== false) {
                if (!user) return toast({ title: "Sign in required", description: "Please sign in to join events." });
                await joinEvent({ eventId, userId: user.id });
                toast({ title: "Joined Event 🎉", description: "You successfully joined this event." });
              }
            }}
            className={`mt-6 w-full py-4 rounded-xl font-bold ${
              availability?.isSoldOut === true
                ? "bg-zinc-700 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {existing || existingWaitlist ? "Already Joined" : availability?.isSoldOut === true ? "Sold Out" : "Join Event"}
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="mt-3 w-full border border-white/10 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-xl font-bold"
          >
            Share Event
          </button>

          <div className="text-xs text-zinc-500 mt-4 flex items-center gap-2">
            <Ticket size={14} />
            {availability?.remainingTickets ?? 0} tickets remaining
          </div>

          <div className="mt-6 bg-black border border-white/10 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-2">
              {availability?.purchasedCount ?? 0} attending
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
      <div className="text-red-500 mb-2">{icon}</div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
