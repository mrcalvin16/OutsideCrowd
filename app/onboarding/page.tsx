"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [role, setRole] = useState<"attendee" | "organizer" | "">("");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const complete = () => {
    // lightweight local activation for now
    localStorage.setItem("outsidecrowd_role", role);
    localStorage.setItem("outsidecrowd_interests", JSON.stringify(interests));

    router.push("/explore");
  };

  const interestOptions = [
    "Music",
    "Nightlife",
    "Tech",
    "Food",
    "Fitness",
    "Art",
    "Networking",
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-18%] top-[-10%] h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="absolute right-[-18%] top-[18%] h-[420px] w-[420px] rounded-full bg-violet-500/15 blur-[120px]" />
      </div>

      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
          Welcome to OutsideCrowd
        </h1>

        <p className="mt-3 text-sm text-white/60">
          Tell us what you’re into so we can shape your feed.
        </p>

        {/* ROLE */}
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-300">
            I am a
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {["attendee", "organizer"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r as any)}
                className={`rounded-2xl border px-5 py-4 text-sm font-bold transition ${
                  role === r
                    ? "border-orange-400 bg-orange-500/20 text-white"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* INTERESTS */}
        <div className="mt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-violet-300">
            I’m interested in
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            {interestOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleInterest(item)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  interests.includes(item)
                    ? "border-violet-400 bg-violet-500/20 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={complete}
          disabled={!role}
          className="mt-10 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition disabled:opacity-30"
        >
          Enter OutsideCrowd
        </button>
      </section>
    </main>
  );
}
