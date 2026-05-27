"use client";

import Link from "next/link";

export default function EventPins({
  events,
}: {
  events: any[];
}) {
  const positions = [
    ["18%", "30%"],
    ["42%", "22%"],
    ["68%", "35%"],
    ["30%", "58%"],
    ["58%", "62%"],
    ["78%", "72%"],
    ["18%", "76%"],
    ["47%", "42%"],
    ["85%", "48%"],
    ["12%", "48%"],
    ["36%", "82%"],
    ["66%", "18%"],
  ];

  return (
    <>
      {events.slice(0, 12).map((event, index) => {
        const [left, top] = positions[index % positions.length];

        return (
          <Link
            key={event._id}
            href={`/events/${event._id}`}
            className="group absolute z-20"
            style={{ left, top }}
          >
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-white text-lg font-black text-black shadow-2xl transition group-hover:scale-110">
                {index + 1}
              </div>

              <div className="pointer-events-none absolute left-1/2 top-14 hidden w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/95 p-3 shadow-2xl group-hover:block">
                <p className="text-sm font-bold text-white">
                  {event.name}
                </p>

                <p className="mt-1 text-xs text-white/50">
                  {event.venueName || event.city || "Venue TBA"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}
