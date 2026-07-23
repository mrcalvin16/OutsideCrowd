"use client";

import { FormEvent, useMemo, useState } from "react";

type GuestStatus = "Not checked in" | "Checked in";

type Guest = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  orderNumber: string;
  status: GuestStatus;
};

type ActivityItem = {
  id: string;
  name: string;
  ticketType: string;
  time: string;
  method: "QR scan" | "Manual";
};

const EVENTS = [
  {
    id: "summer-night",
    name: "OutsideCrowd Summer Night",
    date: "Saturday, August 8",
    venue: "The Fillmore New Orleans",
    sold: 640,
    checkedIn: 418,
    vip: 42,
    comp: 31,
  },
  {
    id: "rooftop-series",
    name: "Rooftop Day Party",
    date: "Sunday, August 16",
    venue: "New Orleans, LA",
    sold: 320,
    checkedIn: 0,
    vip: 24,
    comp: 18,
  },
];

const INITIAL_GUESTS: Guest[] = [
  {
    id: "guest-1",
    name: "Jordan Williams",
    email: "jordan@example.com",
    ticketType: "VIP Admission",
    orderNumber: "OC-1048",
    status: "Not checked in",
  },
  {
    id: "guest-2",
    name: "Taylor Johnson",
    email: "taylor@example.com",
    ticketType: "General Admission",
    orderNumber: "OC-1049",
    status: "Not checked in",
  },
  {
    id: "guest-3",
    name: "Morgan Davis",
    email: "morgan@example.com",
    ticketType: "Comp Ticket",
    orderNumber: "OC-1050",
    status: "Checked in",
  },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: "activity-1",
    name: "Morgan Davis",
    ticketType: "Comp Ticket",
    time: "8:14 PM",
    method: "QR scan",
  },
  {
    id: "activity-2",
    name: "Chris Thomas",
    ticketType: "General Admission",
    time: "8:12 PM",
    method: "Manual",
  },
  {
    id: "activity-3",
    name: "Alexis Brown",
    ticketType: "VIP Admission",
    time: "8:10 PM",
    method: "QR scan",
  },
];

function getCurrentTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export default function HostCheckInPage() {
  const [eventId, setEventId] = useState(EVENTS[0].id);
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [notice, setNotice] = useState<{
    tone: "success" | "warning";
    title: string;
    message: string;
  } | null>(null);

  const selectedEvent =
    EVENTS.find((event) => event.id === eventId) ?? EVENTS[0];

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return guests;
    }

    return guests.filter((guest) =>
      [
        guest.name,
        guest.email,
        guest.ticketType,
        guest.orderNumber,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [guests, search]);

  const checkedInCount =
    selectedEvent.checkedIn +
    guests.filter(
      (guest, index) =>
        guest.status === "Checked in" &&
        INITIAL_GUESTS[index]?.status !== "Checked in",
    ).length;

  const attendancePercentage = Math.min(
    100,
    Math.round((checkedInCount / selectedEvent.sold) * 100),
  );

  function checkInGuest(guestId: string, method: ActivityItem["method"]) {
    const guest = guests.find((item) => item.id === guestId);

    if (!guest) {
      return;
    }

    if (guest.status === "Checked in") {
      setNotice({
        tone: "warning",
        title: "Already checked in",
        message: `${guest.name} has already entered this event.`,
      });
      return;
    }

    setGuests((currentGuests) =>
      currentGuests.map((item) =>
        item.id === guestId
          ? {
              ...item,
              status: "Checked in",
            }
          : item,
      ),
    );

    setActivity((currentActivity) => [
      {
        id: `${guest.id}-${Date.now()}`,
        name: guest.name,
        ticketType: guest.ticketType,
        time: getCurrentTime(),
        method,
      },
      ...currentActivity,
    ]);

    setNotice({
      tone: "success",
      title: `Welcome, ${guest.name}`,
      message: `${guest.ticketType} successfully checked in.`,
    });
  }

  function submitManualCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = manualCode.trim().toLowerCase();

    if (!code) {
      return;
    }

    const guest = guests.find(
      (item) =>
        item.orderNumber.toLowerCase() === code ||
        item.email.toLowerCase() === code,
    );

    if (!guest) {
      setNotice({
        tone: "warning",
        title: "Ticket not found",
        message: "Confirm the code or search for the guest by name or email.",
      });
      return;
    }

    checkInGuest(guest.id, "Manual");
    setManualCode("");
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-400">
            Door Operations
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Check-In
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Scan tickets, find guests, prevent duplicate entry, and monitor
            attendance from one workspace.
          </p>
        </div>

        <div className="w-full xl:w-[360px]">
          <label
            htmlFor="event"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500"
          >
            Active event
          </label>

          <select
            id="event"
            value={eventId}
            onChange={(event) => {
              setEventId(event.target.value);
              setNotice(null);
            }}
            className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition focus:border-orange-400/60"
          >
            {EVENTS.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black text-white">
                {selectedEvent.name}
              </h2>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Doors open
              </span>
            </div>

            <p className="mt-1 text-sm text-zinc-500">
              {selectedEvent.date} · {selectedEvent.venue}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-semibold text-zinc-300">
              Live operations active
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Checked In"
          value={checkedInCount.toLocaleString()}
          detail={`${attendancePercentage}% of tickets`}
        />

        <StatCard
          label="Tickets Sold"
          value={selectedEvent.sold.toLocaleString()}
          detail={`${selectedEvent.sold - checkedInCount} remaining`}
        />

        <StatCard
          label="VIP Guests"
          value={selectedEvent.vip.toLocaleString()}
          detail="Priority admission"
        />

        <StatCard
          label="Comp Tickets"
          value={selectedEvent.comp.toLocaleString()}
          detail="Issued by organizers"
        />
      </section>

      {notice ? (
        <section
          className={`flex items-start justify-between gap-4 rounded-3xl border p-5 ${
            notice.tone === "success"
              ? "border-emerald-400/20 bg-emerald-400/10"
              : "border-amber-400/20 bg-amber-400/10"
          }`}
        >
          <div>
            <p
              className={`text-sm font-black ${
                notice.tone === "success"
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {notice.title}
            </p>

            <p className="mt-1 text-sm text-zinc-300">{notice.message}</p>
          </div>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded-full px-3 py-1 text-sm font-bold text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss notification"
          >
            Close
          </button>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-black text-white">QR scanner</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Camera integration will be connected next.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  scannerActive
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                {scannerActive ? "Camera active" : "Camera off"}
              </span>
            </div>

            <div className="p-5">
              <div
                className={`relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] border transition ${
                  scannerActive
                    ? "border-orange-400/50 bg-orange-400/[0.04]"
                    : "border-white/10 bg-black"
                }`}
              >
                <div className="absolute inset-8">
                  <span className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-orange-400" />
                  <span className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-orange-400" />
                  <span className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-orange-400" />
                  <span className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-orange-400" />
                </div>

                {scannerActive ? (
                  <div className="absolute left-10 right-10 top-1/2 h-px bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.9)]" />
                ) : null}

                <div className="relative z-10 max-w-sm px-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                    ◫
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white">
                    {scannerActive
                      ? "Position the QR code inside the frame"
                      : "Scanner ready"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {scannerActive
                      ? "This is the scanner preview state. Camera decoding will be added in the next phase."
                      : "Start the scanner to prepare the door operations workspace."}
                  </p>

                  <button
                    type="button"
                    onClick={() => setScannerActive((current) => !current)}
                    className={`mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-black transition ${
                      scannerActive
                        ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {scannerActive ? "Stop scanner" : "Start scanner"}
                  </button>
                </div>
              </div>

              <form
                onSubmit={submitManualCode}
                className="mt-5 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value)}
                  placeholder="Enter order number or guest email"
                  className="h-12 flex-1 rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/60"
                />

                <button
                  type="submit"
                  className="h-12 rounded-2xl bg-orange-400 px-6 text-sm font-black text-black transition hover:bg-orange-300"
                >
                  Validate ticket
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-black text-white">Guest search</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Search by name, email, ticket type, or order number.
              </p>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search the guest list..."
                className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/60"
              />
            </div>

            <div className="divide-y divide-white/10">
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold text-white">
                          {guest.name}
                        </p>

                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
                          {guest.ticketType}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {guest.email} · {guest.orderNumber}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => checkInGuest(guest.id, "Manual")}
                      className={`h-10 shrink-0 rounded-xl px-4 text-xs font-black transition ${
                        guest.status === "Checked in"
                          ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "bg-white text-black hover:bg-zinc-200"
                      }`}
                    >
                      {guest.status === "Checked in"
                        ? "Checked in"
                        : "Check in"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <p className="font-bold text-white">No guests found</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Try another name, email address, or order number.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-zinc-950 xl:sticky xl:top-6 xl:h-fit">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-white">Recent activity</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Latest door entries
                </p>
              </div>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-400">
                Live
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {activity.slice(0, 8).map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.ticketType} · {item.method}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-black text-emerald-300">
                      ✓
                    </span>
                    <p className="mt-2 text-xs font-semibold text-zinc-500">
                      {item.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </article>
  );
}
