"use client";

import type { Id } from "@/convex/_generated/dataModel";
import EventSelector from "../cards/EventSelector";
import GateSelector from "../cards/GateSelector";

type OrganizerEvent = {
  _id: Id<"events">;
  name: string;
};

type CheckInHeaderProps = {
  events: OrganizerEvent[];
  eventId: Id<"events"> | null;
  gate: string;
  onEventChange: (eventId: Id<"events">) => void;
  onGateChange: (gate: string) => void;
};

export default function CheckInHeader({
  events,
  eventId,
  gate,
  onEventChange,
  onGateChange,
}: CheckInHeaderProps) {
  return (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-400">
          Door Operations
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Check-In
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Scan tickets, find guests, prevent duplicate entry,
          and monitor live attendance.
        </p>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
        <EventSelector
          events={events}
          eventId={eventId}
          onEventChange={onEventChange}
        />

        <GateSelector
          gate={gate}
          onGateChange={onGateChange}
        />
      </div>
    </header>
  );
}
