"use client";

import TeamPermissionsWorkspace from "@/components/host/team/TeamPermissionsWorkspace";
import { useEventCommandCenter } from "@/components/host/events/command-center/EventCommandCenter";

export default function EventTeamPage() {
  const { event } = useEventCommandCenter();
  return <TeamPermissionsWorkspace fixedEventId={event._id} />;
}
