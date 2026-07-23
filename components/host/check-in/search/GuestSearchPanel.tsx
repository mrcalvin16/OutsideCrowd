"use client";

import type { Id } from "@/convex/_generated/dataModel";

type Guest = {
  ticketId: Id<"tickets">;
  name: string;
  email?: string | null;
  orderNumber: string;
  ticketType: string;
  quantity: number;
  checkedIn: boolean;
};

type GuestSearchPanelProps = {
  guests: Guest[];
  search: string;
  onSearchChange: (value: string) => void;
  isSubmitting: boolean;
  onCheckIn: (
    ticketId: Id<"tickets">,
  ) => void | Promise<void>;
  onUndo: (
    ticketId: Id<"tickets">,
  ) => void | Promise<void>;
};

export default function GuestSearchPanel({
  guests,
  search,
  onSearchChange,
  isSubmitting,
  onCheckIn,
  onUndo,
}: GuestSearchPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-black text-white">
              Guest search
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Search by name, email, order, or QR value.
            </p>
          </div>

          <span className="text-xs font-semibold text-zinc-500">
            {guests.length} guests shown
          </span>
        </div>

        <input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search the guest list..."
          className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/60"
        />
      </div>

      <div className="max-h-[620px] divide-y divide-white/10 overflow-y-auto">
        {guests.length > 0 ? (
          guests.map((guest) => (
            <div
              key={guest.ticketId}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-bold text-white">
                    {guest.name}
                  </p>

                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
                    {guest.ticketType}
                  </span>

                  {guest.quantity > 1 ? (
                    <span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-[11px] font-bold text-orange-300">
                      {guest.quantity} guests
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-sm text-zinc-500">
                  {guest.email || "No guest email"}
                  {" · "}
                  {guest.orderNumber}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {guest.checkedIn ? (
                  <>
                    <span className="inline-flex h-10 items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 text-xs font-black text-emerald-300">
                      Checked in
                    </span>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onUndo(guest.ticketId)}
                      className="h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                      Undo
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onCheckIn(guest.ticketId)}
                    className="h-10 rounded-xl bg-white px-4 text-xs font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Check in
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center">
            <p className="font-bold text-white">
              No guests found
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Try another name, email, order number, or QR value.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
