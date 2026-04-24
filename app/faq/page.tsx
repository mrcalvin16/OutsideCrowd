export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8">FAQ</h1>

        {[
          ["What is OutsideCrowd?", "OutsideCrowd is an event discovery and ticketing platform for parties, concerts, reunions, pop-ups, and local experiences."],
          ["How do I join an event?", "Create an account, open an event page, and click Join Event."],
          ["Where do I see my tickets?", "Go to My Tickets after joining an event."],
          ["Can organizers create events?", "Yes. Organizers can create events, upload images, manage attendees, and track budgets."],
          ["Are payments live yet?", "Payments are not live yet. Paid checkout will be added later."]
        ].map(([q, a]) => (
          <div key={q} className="border border-white/10 bg-zinc-900 rounded-2xl p-5 mb-4">
            <h2 className="font-bold text-lg">{q}</h2>
            <p className="text-zinc-400 mt-2">{a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
