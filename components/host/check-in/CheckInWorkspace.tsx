"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import CameraScanner from "./CameraScanner";

type CheckInMethod = "qr" | "manual" | "search";

type CheckInResult = {
  status: "success" | "duplicate" | "error";
  guestName: string;
  ticketType: string;
  quantity: number;
  message?: string;
  checkedInAt?: number;
};

export default function HostCheckInPage() {
  const organizerEvents = useQuery(api.checkIn.getOrganizerEvents);

  const [eventId, setEventId] = useState<Id<"events"> | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [search, setSearch] = useState("");
  const [gate, setGate] = useState("Main Gate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  const scannerInputRef = useRef<HTMLInputElement>(null);

  const workspace = useQuery(
    api.checkIn.getWorkspace,
    eventId ? { eventId } : "skip",
  );

  const checkInTicket = useMutation(api.checkIn.checkInTicket);
  const undoCheckIn = useMutation(api.checkIn.undoCheckIn);

  useEffect(() => {
    if (
      !eventId &&
      organizerEvents &&
      organizerEvents.length > 0
    ) {
      setEventId(organizerEvents[0]._id);
    }
  }, [eventId, organizerEvents]);

  useEffect(() => {
    if (!result) {
      return;
    }

    if (result.status === "success") {
      const timer = window.setTimeout(() => {
        setResult(null);

        if (scannerActive) {
          scannerInputRef.current?.focus();
        }
      }, 1800);

      return () => window.clearTimeout(timer);
    }
  }, [result, scannerActive]);

  const filteredGuests = useMemo(() => {
    const guests = workspace?.guests ?? [];
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
        guest.qrCode,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [search, workspace?.guests]);

  const attendancePercentage =
    workspace && workspace.stats.totalGuests > 0
      ? Math.min(
          100,
          Math.round(
            (workspace.stats.checkedIn /
              workspace.stats.totalGuests) *
              100,
          ),
        )
      : 0;

  async function performCheckIn(
    ticketId: Id<"tickets">,
    method: CheckInMethod,
  ) {
    if (!eventId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await checkInTicket({
        eventId,
        ticketId,
        method,
        gate,
      });

      setResult({
        status: response.status,
        guestName: response.guestName,
        ticketType: response.ticketType,
        quantity: response.quantity,
        checkedInAt: response.checkedInAt,
        message:
          response.status === "duplicate"
            ? "This ticket has already been checked in."
            : undefined,
      });
    } catch (error) {
      setResult({
        status: "error",
        guestName: "Unable to check in",
        ticketType: "",
        quantity: 0,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while checking in this ticket.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitCode(
    rawCode: string,
    method: CheckInMethod,
  ) {
    const code = rawCode.trim().toLowerCase();

    if (!code || !workspace) {
      return;
    }

    const guest = workspace.guests.find((item) =>
      [
        item.qrCode,
        item.orderNumber,
        item.email,
        String(item.ticketId),
      ].some(
        (value) =>
          String(value ?? "").trim().toLowerCase() === code,
      ),
    );

    if (!guest) {
      setResult({
        status: "error",
        guestName: "Ticket not found",
        ticketType: "",
        quantity: 0,
        message:
          "Confirm the QR code, order number, or guest email and try again.",
      });

      return;
    }

    await performCheckIn(guest.ticketId, method);
  }

  async function handleManualSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await submitCode(manualCode, "manual");
    setManualCode("");
  }

  async function handleScannerSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const code = String(form.get("scannerCode") ?? "");

    await submitCode(code, "qr");
    event.currentTarget.reset();
  }

  async function handleUndo(ticketId: Id<"tickets">) {
    if (!eventId || isSubmitting) {
      return;
    }

    const confirmed = window.confirm(
      "Undo this guest's check-in?",
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      await undoCheckIn({
        eventId,
        ticketId,
      });

      setResult(null);
    } catch (error) {
      setResult({
        status: "error",
        guestName: "Unable to undo check-in",
        ticketType: "",
        quantity: 0,
        message:
          error instanceof Error
            ? error.message
            : "The check-in could not be reversed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (organizerEvents === undefined) {
    return <CheckInLoadingState />;
  }

  if (organizerEvents.length === 0) {
    return <NoEventsState />;
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
            Scan tickets, find guests, prevent duplicate entry,
            and monitor live attendance.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
          <div>
            <label
              htmlFor="active-event"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500"
            >
              Active event
            </label>

            <select
              id="active-event"
              value={eventId ?? ""}
              onChange={(event) => {
                setEventId(
                  event.target.value as Id<"events">,
                );
                setResult(null);
                setSearch("");
                setManualCode("");
              }}
              className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition focus:border-orange-400/60"
            >
              {organizerEvents.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="gate"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500"
            >
              Current gate
            </label>

            <select
              id="gate"
              value={gate}
              onChange={(event) => setGate(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition focus:border-orange-400/60"
            >
              <option>Main Gate</option>
              <option>VIP Entrance</option>
              <option>Gate A</option>
              <option>Gate B</option>
              <option>Box Office</option>
            </select>
          </div>
        </div>
      </header>

      {workspace === undefined ? (
        <WorkspaceLoadingState />
      ) : workspace === null ? (
        <NoAccessState />
      ) : (
        <>
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-black text-white">
                    {workspace.event.name}
                  </h2>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Live
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  {workspace.event.dateString || "Date not set"}
                  {" · "}
                  {workspace.event.venueName ||
                    workspace.event.location ||
                    "Venue not set"}
                </p>
              </div>

              <div className="min-w-0 lg:w-[360px]">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400">
                    Attendance progress
                  </span>

                  <span className="font-black text-white">
                    {workspace.stats.checkedIn} /{" "}
                    {workspace.stats.totalGuests}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all duration-500"
                    style={{
                      width: `${attendancePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Checked In"
              value={workspace.stats.checkedIn.toLocaleString()}
              detail={`${attendancePercentage}% attendance`}
            />

            <StatCard
              label="Remaining"
              value={workspace.stats.remaining.toLocaleString()}
              detail="Guests not yet admitted"
            />

            <StatCard
              label="Total Guests"
              value={workspace.stats.totalGuests.toLocaleString()}
              detail="Across all ticket quantities"
            />

            <StatCard
              label="Orders"
              value={workspace.stats.orders.toLocaleString()}
              detail="Ticket records"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-black text-white">
                      QR scanner
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      Supports camera scans and hardware QR
                      scanners.
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      scannerActive
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    {scannerActive
                      ? `${gate} active`
                      : "Scanner off"}
                  </span>
                </div>

                <div className="p-5">
                  <CameraScanner
                    active={scannerActive}
                    disabled={isSubmitting}
                    onActiveChange={setScannerActive}
                    onScan={async (value) => {
                      await submitCode(value, "qr");
                    }}
                    onError={(message) => {
                      setResult({
                        status: "error",
                        guestName: "Camera unavailable",
                        ticketType: "",
                        quantity: 0,
                        message,
                      });
                    }}
                  />

                  <form
                    onSubmit={handleScannerSubmit}
                    className="mt-5"
                  >
                    <label
                      htmlFor="scanner-code"
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500"
                    >
                      Scanner input
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        ref={scannerInputRef}
                        id="scanner-code"
                        name="scannerCode"
                        disabled={!scannerActive || isSubmitting}
                        autoComplete="off"
                        placeholder={
                          scannerActive
                            ? "Scan QR code now..."
                            : "Start scanner to enable"
                        }
                        className="h-12 flex-1 rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="submit"
                        disabled={!scannerActive || isSubmitting}
                        className="h-12 rounded-2xl bg-orange-400 px-6 text-sm font-black text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting ? "Checking..." : "Process scan"}
                      </button>
                    </div>
                  </form>

                  <form
                    onSubmit={handleManualSubmit}
                    className="mt-5 border-t border-white/10 pt-5"
                  >
                    <label
                      htmlFor="manual-code"
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500"
                    >
                      Manual validation
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        id="manual-code"
                        value={manualCode}
                        onChange={(event) =>
                          setManualCode(event.target.value)
                        }
                        disabled={isSubmitting}
                        placeholder="Order number, QR value, or guest email"
                        className="h-12 flex-1 rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/60 disabled:opacity-50"
                      />

                      <button
                        type="submit"
                        disabled={
                          !manualCode.trim() || isSubmitting
                        }
                        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Validate ticket
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-zinc-950">
                <div className="border-b border-white/10 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-black text-white">
                        Guest search
                      </h2>

                      <p className="mt-1 text-xs text-zinc-500">
                        Search by name, email, order, or QR
                        value.
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-zinc-500">
                      {filteredGuests.length} guests shown
                    </span>
                  </div>

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search the guest list..."
                    className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/60"
                  />
                </div>

                <div className="max-h-[620px] divide-y divide-white/10 overflow-y-auto">
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map((guest) => (
                      <div
                        key={guest.ticketId}
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

                            {guest.quantity > 1 ? (
                              <span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-[11px] font-bold text-orange-300">
                                {guest.quantity} guests
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 truncate text-sm text-zinc-500">
                            {guest.email || "No guest email"}
                            {" · "}
                            {guest.orderNumber}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {guest.checkedIn ? (
                            <>
                              <span className="inline-flex h-10 items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 text-xs font-black text-emerald-300">
                                Checked in
                              </span>

                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() =>
                                  handleUndo(guest.ticketId)
                                }
                                className="h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                              >
                                Undo
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() =>
                                performCheckIn(
                                  guest.ticketId,
                                  "search",
                                )
                              }
                              className="h-10 rounded-xl bg-white px-4 text-xs font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Check in
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <p className="font-bold text-white">
                        No guests found
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Try another name, email, order number,
                        or QR value.
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
                    <h2 className="font-black text-white">
                      Recent activity
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      Live entry history
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Live
                  </span>
                </div>
              </div>

              {workspace.recentActivity.length > 0 ? (
                <div className="max-h-[760px] divide-y divide-white/10 overflow-y-auto">
                  {workspace.recentActivity.map((item) => (
                    <div key={item._id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {item.guestName}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {item.ticketType}
                            {" · "}
                            {formatMethod(item.method)}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {item.gate}
                            {item.quantity > 1
                              ? ` · ${item.quantity} guests`
                              : ""}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-black text-emerald-300">
                            ✓
                          </span>

                          <p className="mt-2 text-xs font-semibold text-zinc-500">
                            {formatTime(item.checkedInAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="font-bold text-white">
                    No check-ins yet
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Successful entries will appear here.
                  </p>
                </div>
              )}
            </aside>
          </section>
        </>
      )}

      {result ? (
        <CheckInResultOverlay
          result={result}
          onClose={() => {
            setResult(null);
            scannerInputRef.current?.focus();
          }}
        />
      ) : null}


    </div>
  );
}

function CheckInResultOverlay({
  result,
  onClose,
}: {
  result: CheckInResult;
  onClose: () => void;
}) {
  const isSuccess = result.status === "success";
  const isDuplicate = result.status === "duplicate";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Check-in result"
    >
      <div
        className={`w-full max-w-lg rounded-[36px] border p-8 text-center shadow-2xl ${
          isSuccess
            ? "border-emerald-400/30 bg-emerald-950"
            : isDuplicate
              ? "border-amber-400/30 bg-amber-950"
              : "border-red-400/30 bg-red-950"
        }`}
      >
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl font-black ${
            isSuccess
              ? "bg-emerald-400 text-black"
              : isDuplicate
                ? "bg-amber-400 text-black"
                : "bg-red-400 text-black"
          }`}
        >
          {isSuccess ? "✓" : isDuplicate ? "!" : "×"}
        </div>

        <p
          className={`mt-6 text-xs font-black uppercase tracking-[0.28em] ${
            isSuccess
              ? "text-emerald-300"
              : isDuplicate
                ? "text-amber-300"
                : "text-red-300"
          }`}
        >
          {isSuccess
            ? "Checked In"
            : isDuplicate
              ? "Duplicate Scan"
              : "Unable to Check In"}
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          {result.guestName}
        </h2>

        {result.ticketType ? (
          <p className="mt-2 text-base font-semibold text-white/70">
            {result.ticketType}
            {result.quantity > 1
              ? ` · ${result.quantity} guests`
              : ""}
          </p>
        ) : null}

        {result.message ? (
          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/60">
            {result.message}
          </p>
        ) : null}

        {isDuplicate && result.checkedInAt ? (
          <p className="mt-3 text-sm font-semibold text-amber-200">
            Originally checked in at{" "}
            {formatTime(result.checkedInAt)}
          </p>
        ) : null}

        {!isSuccess ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-7 h-12 rounded-full bg-white px-7 text-sm font-black text-black transition hover:bg-zinc-200"
          >
            Return to scanner
          </button>
        ) : (
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Scanner resetting...
          </p>
        )}
      </div>
    </div>
  );
}

function ScannerCorner({
  position,
}: {
  position:
    | "left-top"
    | "right-top"
    | "left-bottom"
    | "right-bottom";
}) {
  const positionClasses = {
    "left-top":
      "left-0 top-0 rounded-tl-2xl border-l-4 border-t-4",
    "right-top":
      "right-0 top-0 rounded-tr-2xl border-r-4 border-t-4",
    "left-bottom":
      "bottom-0 left-0 rounded-bl-2xl border-b-4 border-l-4",
    "right-bottom":
      "bottom-0 right-0 rounded-br-2xl border-b-4 border-r-4",
  };

  return (
    <span
      className={`absolute h-12 w-12 border-orange-400 ${positionClasses[position]}`}
    />
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

function CheckInLoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl bg-white/5"
          />
        ))}
      </div>
      <div className="h-[520px] animate-pulse rounded-3xl bg-white/5" />
    </div>
  );
}

function WorkspaceLoadingState() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
      <div className="h-[580px] animate-pulse rounded-3xl bg-white/5" />
      <div className="h-[580px] animate-pulse rounded-3xl bg-white/5" />
    </div>
  );
}

function NoEventsState() {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-400">
        Door Operations
      </p>

      <h1 className="mt-3 text-3xl font-black text-white">
        No events available
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
        Create an event before opening the Check-In workspace.
      </p>
    </div>
  );
}

function NoAccessState() {
  return (
    <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
      <h2 className="text-xl font-black text-white">
        Unable to open this event
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        The event could not be found or you do not have
        permission to manage its check-in.
      </p>
    </div>
  );
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatMethod(method: string) {
  if (method === "qr") {
    return "QR scan";
  }

  if (method === "search") {
    return "Guest search";
  }

  return "Manual entry";
}
