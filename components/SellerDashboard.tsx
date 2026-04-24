"use client";

import EventForm from "@/components/EventForm";

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-6">Host an Event</h1>
        <EventForm mode="create" />
      </div>
    </div>
  );
}
