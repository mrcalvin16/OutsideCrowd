"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function HostPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Host an Event</h1>
            <p className="mt-2 text-white/60">
              Create events, sell tickets, and manage your crowd.
            </p>
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-full bg-white px-5 py-2 font-semibold text-black">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Logged OUT state */}
        <SignedOut>
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
            <h2 className="text-2xl font-semibold">
              Login to start hosting
            </h2>
            <p className="mt-3 text-white/60">
              You need an account to create and manage events.
            </p>

            <SignInButton mode="modal">
              <button className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-black">
                Login
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Logged IN state */}
        <SignedIn>
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/host/create"
              className="rounded-3xl border border-white/10 bg-zinc-950 p-8 hover:bg-zinc-900"
            >
              <h2 className="text-xl font-semibold">Create Event</h2>
              <p className="mt-2 text-white/60">
                Build a new event and start selling tickets.
              </p>
            </Link>

            <Link
              href="/host/events"
              className="rounded-3xl border border-white/10 bg-zinc-950 p-8 hover:bg-zinc-900"
            >
              <h2 className="text-xl font-semibold">My Events</h2>
              <p className="mt-2 text-white/60">
                Manage your existing events.
              </p>
            </Link>

            <Link
              href="/host/orders"
              className="rounded-3xl border border-white/10 bg-zinc-950 p-8 hover:bg-zinc-900"
            >
              <h2 className="text-xl font-semibold">Orders</h2>
              <p className="mt-2 text-white/60">
                Track ticket sales and attendees.
              </p>
            </Link>
          </div>
        </SignedIn>
      </section>
    </main>
  );
}