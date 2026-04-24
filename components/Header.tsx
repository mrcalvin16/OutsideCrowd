"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-red-900/40 shadow-lg shadow-red-950/20">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link href="/" className="text-3xl font-black tracking-tight text-white">
          Outside<span className="text-red-600">Crowd</span>
        </Link>

        <div className="hidden md:flex flex-1 items-center rounded-2xl border border-red-900/40 bg-zinc-950 px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-zinc-500" />
          <input
            placeholder="Search for events, parties, concerts..."
            className="w-full bg-transparent text-white placeholder:text-zinc-500 outline-none"
          />
          <button className="rounded-xl bg-red-600 px-6 py-2 font-bold text-white hover:bg-red-700">
            Search
          </button>
        </div>

        <nav className="ml-auto flex items-center gap-3">
          <Link href="/seller" className="rounded-xl border border-red-600 px-5 py-3 font-bold text-white hover:bg-red-600">
            Host Event
          </Link>
          <Link href="/tickets" className="rounded-xl bg-zinc-900 px-5 py-3 font-bold text-white hover:bg-zinc-800">
            My Tickets
          </Link>
          {user && <UserButton afterSignOutUrl="/" />}
        </nav>
      </div>
    </header>
  );
}
