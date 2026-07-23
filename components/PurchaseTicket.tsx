"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PurchaseTicket({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Ticket className="h-6 w-6 text-amber-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Get Your Tickets
            </h3>

            <p className="text-sm text-gray-500">
              Select ticket quantities and complete secure checkout.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/events/${eventId}/checkout`)}
          className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-amber-600 hover:to-amber-700"
        >
          Continue to Checkout →
        </button>
      </div>
    </div>
  );
}
