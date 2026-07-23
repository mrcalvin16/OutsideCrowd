"use client";

export default function NoEventsState() {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-400">
        Door Operations
      </p>

      <h1 className="mt-3 text-3xl font-black text-white">
        No events available
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
        Create an event before opening the Check-In workspace.
      </p>
    </div>
  );
}
