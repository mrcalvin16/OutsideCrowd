"use client";

export default function NoAccessState() {
  return (
    <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
      <h2 className="text-xl font-black text-white">
        Unable to open this event
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        The event could not be found or you do not have
        permission to manage its check-in.
      </p>
    </div>
  );
}
