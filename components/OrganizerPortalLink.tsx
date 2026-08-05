"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrganizerPortalLink({
  className,
  organizerLabel = "Host Dashboard",
  attendeeLabel = "Become a Host",
  organizerHref = "/host",
}: {
  className?: string;
  organizerLabel?: string;
  attendeeLabel?: string;
  organizerHref?: string;
}) {
  const { isSignedIn } = useAuth();
  const user = useQuery(api.users.getCurrentUser, isSignedIn ? {} : "skip");
  const ownedEvents = useQuery(api.events.getMyEvents, isSignedIn ? {} : "skip");
  const canAccess = user?.isOrganizer === true || Boolean(ownedEvents?.length);

  return (
    <Link prefetch={false} href={canAccess ? organizerHref : "/onboarding"} className={className}>
      {canAccess ? organizerLabel : attendeeLabel}
    </Link>
  );
}
