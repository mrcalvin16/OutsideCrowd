import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">
          OutsideCrowd
        </p>

        <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
          Discover Events.
          <br />
          Buy Tickets.
          <br />
          Build Community.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          The modern event marketplace for organizers and attendees.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/events"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
          >
            Browse Events
          </Link>

          <Link
            href="/host/create"
            className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold transition hover:bg-zinc-900"
          >
            Create Event
          </Link>

          <Link
            href="/my-tickets"
            className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold transition hover:bg-zinc-900"
          >
            My Tickets
          </Link>

          <Link
            href="/admin/checkin"
            className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            Admin Check-In
          </Link>
        </div>

        <div className="mt-10">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-center gap-4">
              <p className="text-sm text-zinc-400">
                Signed in successfully
              </p>

              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </section>
    </main>
  );
}