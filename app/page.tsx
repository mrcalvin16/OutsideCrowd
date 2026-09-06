import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import FeaturedEvents from "@/components/home/FeaturedEvents";

const highlights = [
  ["Discover", "Concerts, culture, food, nightlife, and community—together in one place."],
  ["Plan", "Save the functions you want to attend and keep every ticket within reach."],
  ["Host", "Create, promote, and manage memorable experiences from one organizer workspace."],
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(139,92,246,0.24),transparent_32%),linear-gradient(to_bottom,#050505,#000)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:72px_72px]" />

      <nav className="relative z-20 border-b border-white/10 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Function Hour home">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-violet-600 text-xs font-black shadow-[0_0_28px_rgba(249,115,22,.28)]">FH</span>
            <span className="text-xl font-black tracking-tight">Function<span className="text-violet-400">Hour</span></span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/events" className="hidden rounded-full px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white sm:inline-flex">Browse Events</Link>
            <Link href="/map" className="hidden rounded-full px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white md:inline-flex">Map</Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-zinc-200 sm:px-5">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/my-tickets" className="hidden rounded-full px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex">My Tickets</Link>
              <span className="hidden text-sm font-bold text-white sm:inline">Account</span>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-orange-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300" />
            Your next function starts here
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.94] tracking-[-0.055em] sm:text-7xl lg:text-[5.8rem]">
            Find the moment.
            <span className="mt-2 block bg-gradient-to-r from-orange-300 via-orange-500 to-violet-400 bg-clip-text text-transparent">Make the hour.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
            Discover what is happening around you, secure your tickets, and turn plans into experiences worth remembering.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/events" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3.5 font-black text-black transition hover:-translate-y-0.5 hover:bg-zinc-200">Browse Events</Link>
            <Link href="/host/create" className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-violet-600 px-7 py-3.5 font-black text-white shadow-[0_14px_50px_rgba(139,92,246,.22)] transition hover:-translate-y-0.5">Host an Event</Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 font-black text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10 sm:w-auto">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/my-tickets" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 font-black text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10">View My Tickets</Link>
            </SignedIn>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {highlights.map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                <p className="font-black text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-orange-500/20 to-violet-500/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-black/55 p-5 shadow-[0_30px_100px_rgba(0,0,0,.65)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-violet-300">Live around you</p>
                <h2 className="mt-2 text-3xl font-black">Choose your function.</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-orange-300/20 bg-orange-500/10 text-xl">✦</span>
            </div>

            <div className="mt-8 space-y-3">
              {[
                ["Tonight", "Nightlife & live music", "Now"],
                ["This weekend", "Festivals & food", "Explore"],
                ["Meet your people", "Community & networking", "Connect"],
              ].map(([title, detail, action], index) => (
                <Link key={title} href="/events" className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-orange-300/30 hover:bg-white/[0.08]">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-black ${index === 1 ? "bg-violet-500/20 text-violet-200" : "bg-orange-500/15 text-orange-200"}`}>{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black">{title}</span>
                    <span className="mt-1 block text-sm text-white/45">{detail}</span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-white/40 transition group-hover:text-orange-200">{action} →</span>
                </Link>
              ))}
            </div>

            <Link href="/map" className="mt-5 flex items-center justify-between rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5 text-sm font-black text-violet-100 transition hover:bg-violet-500/15">
              Explore the live event map
              <span aria-hidden="true">⌖</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-black/55 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300">Featured Events</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">What&apos;s happening now.</h2>
              <p className="mt-3 max-w-2xl text-white/50">Explore live experiences from the Function Hour community.</p>
            </div>
            <Link href="/events" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 font-black text-white transition hover:border-white/30 hover:bg-white/10">View All Events →</Link>
          </div>

          <FeaturedEvents />
        </div>
      </section>
    </main>
  );
}
