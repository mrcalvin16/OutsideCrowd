"use client";

import Link from "next/link";

type LiveMapSectionProps = {
  nearbyCount: number;
};

export default function LiveMapSection({
  nearbyCount,
}: LiveMapSectionProps) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-10 sm:px-7 lg:px-8">
      <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0d0d10]">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-orange-300">
              Explore By Area
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
              Discover what is happening around the city.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
              Browse events by neighborhood, venue, category, and distance.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="rounded-full bg-white px-6 py-3 text-sm font-black text-black"
              >
                Open live map
              </Link>

              <div className="rounded-full border border-white/15 px-6 py-3 text-sm font-black text-zinc-300">
                {nearbyCount} experiences nearby
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden border-t border-white/10 bg-black lg:border-l lg:border-t-0">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:54px_54px]" />

            <div className="absolute left-[25%] top-[28%] h-5 w-5 rounded-full bg-orange-400 shadow-[0_0_25px_rgba(251,146,60,1)]" />
            <div className="absolute left-[58%] top-[38%] h-5 w-5 rounded-full bg-violet-400 shadow-[0_0_25px_rgba(167,139,250,1)]" />
            <div className="absolute left-[43%] top-[62%] h-5 w-5 rounded-full bg-orange-400 shadow-[0_0_25px_rgba(251,146,60,1)]" />

            <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/15 bg-black/75 p-5 backdrop-blur-2xl sm:left-auto sm:w-[320px]">
              <p className="font-black text-white">OutsideCrowd Live Map</p>

              <p className="mt-2 text-xs text-zinc-500">
                Events, venues, and neighborhoods.
              </p>

              <Link
                href="/map"
                className="mt-5 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-xs font-black text-white"
              >
                Explore the map →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
