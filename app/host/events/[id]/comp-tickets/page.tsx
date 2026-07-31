"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import CompTicketsWorkspace from "@/components/host/comp-tickets/CompTicketsWorkspace";

export default function EventCompTicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CompTicketsWorkspace
      initialEventId={id as Id<"events">}
      embedded
    />
  );
}
