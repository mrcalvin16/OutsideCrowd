"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrganizerAccessGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const user = useQuery(api.users.getCurrentUser, isSignedIn ? {} : "skip");
  const ownedEvents = useQuery(api.events.getMyEvents, isSignedIn ? {} : "skip");
  const accessLoading = isSignedIn && (user === undefined || ownedEvents === undefined);
  const canAccessOrganizerTools = user?.isOrganizer === true || Boolean(ownedEvents?.length);

  if (!isLoaded || accessLoading) {
    return <AccessScreen title="Loading Organizer OS…" />;
  }

  if (!isSignedIn) {
    return (
      <AccessScreen
        title="Organizer sign-in required"
        description="Sign in with an organizer or event-staff account to continue."
        href="/sign-in"
        action="Sign in"
      />
    );
  }

  if (!canAccessOrganizerTools) {
    return (
      <AccessScreen
        title="Your attendee account is ready"
        description="Organizer tools are kept separate from your tickets, saved events, and event discovery experience."
        href="/my-tickets"
        action="Open My Tickets"
        secondaryHref="/events"
        secondaryAction="Browse Events"
      />
    );
  }

  return children;
}

function AccessScreen({
  title,
  description,
  href,
  action,
  secondaryHref,
  secondaryAction,
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
  secondaryHref?: string;
  secondaryAction?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">OutsideCrowd</p>
        <h1 className="mt-4 text-3xl font-black">{title}</h1>
        {description ? <p className="mt-3 text-zinc-400">{description}</p> : null}
        {href && action ? (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={href} className="rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-6 py-3 font-bold">
              {action}
            </Link>
            {secondaryHref && secondaryAction ? (
              <Link href={secondaryHref} className="rounded-full border border-white/15 px-6 py-3 font-bold hover:bg-white/10">
                {secondaryAction}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
