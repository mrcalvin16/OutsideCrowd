"use client";

import DiscountsWorkspace from "@/components/host/discounts/DiscountsWorkspace";
import { useEventCommandCenter } from "@/components/host/events/command-center/EventCommandCenter";

export default function EventDiscountsPage() {
  const { event } = useEventCommandCenter();
  return <DiscountsWorkspace fixedEventId={event._id} />;
}
