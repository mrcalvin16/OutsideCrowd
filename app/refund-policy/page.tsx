export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-6">Refund Policy</h1>

        <div className="space-y-5 text-zinc-300">
          <p>OutsideCrowd is currently in MVP/private beta. Paid checkout is not live yet.</p>
          <p>Once paid tickets are enabled, refund eligibility may depend on the organizer’s event policy.</p>
          <p>If an event is cancelled by the organizer, attendees may be eligible for a refund according to the payment and organizer terms active at that time.</p>
          <p>Service fees, processing fees, and instant payout fees may be non-refundable unless required by law.</p>
          <p>For support, contact the event organizer or OutsideCrowd support once support channels are enabled.</p>
        </div>
      </section>
    </main>
  );
}
