"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link href="/" className="text-xl font-black text-white">
          OutsideCrowd
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/tickets" className="text-zinc-300 hover:text-white">
            My Tickets
          </Link>
          <Link href="/seller" className="text-zinc-300 hover:text-white">
            Host
          </Link>

          <SignedOut>
            <SignInButton>
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
