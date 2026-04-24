import EventList from "@/components/EventList";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-black">Find your crowd. Book the moment.</h1>
        <p className="mt-4 text-zinc-300 text-xl">
          Discover parties, concerts, reunions, festivals, and local events.
        </p>

        <div className="mt-8 flex gap-4">
          <a href="#events" className="bg-red-600/90 hover:bg-red-600 shadow-lg shadow-red-900/30 transition text-white px-6 py-3 rounded-xl font-bold">
            Browse Events
          </a>
          <a href="/seller" className="bg-white text-black px-6 py-3 rounded-xl font-bold">
            Host Event
          </a>
        </div>
      </section>

      <section id="events" className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-black mb-6">Featured Events</h2>
        <EventList />
      </section>
    </main>
  );
}
