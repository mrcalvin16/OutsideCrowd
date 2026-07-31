"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import CheckInWorkspace from "@/components/host/check-in/CheckInWorkspace";

export default function EventCheckInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CheckInWorkspace
      initialEventId={id as Id<"events">}
      lockEventSelection
    />
  );
}
