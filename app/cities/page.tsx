import Link from "next/link";

const cities = ["New Orleans", "New York", "Atlanta", "Miami", "Los Angeles", "Houston"];

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Cities</p>
        <h1 className="mt-4 text-2xl sm:text-3xl sm:text-5xl font-black">Find experiences by city.</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/events?city=${encodeURIComponent(city)}`}
              className="rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6 text-xl font-black hover:border-orange-400/50"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
