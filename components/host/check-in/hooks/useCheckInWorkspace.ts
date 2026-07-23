"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CheckInResult } from "../results/CheckInResultOverlay";

type CheckInMethod = "qr" | "manual" | "search";

export function useCheckInWorkspace() {
  const organizerEvents = useQuery(
    api.checkIn.getOrganizerEvents,
  );

  const [eventId, setEventId] =
    useState<Id<"events"> | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [search, setSearch] = useState("");
  const [gate, setGate] = useState("Main Gate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] =
    useState<CheckInResult | null>(null);

  const scannerInputRef = useRef<HTMLInputElement>(null);

  const workspace = useQuery(
    api.checkIn.getWorkspace,
    eventId ? { eventId } : "skip",
  );

  const checkInTicket = useMutation(
    api.checkIn.checkInTicket,
  );
  const undoCheckIn = useMutation(
    api.checkIn.undoCheckIn,
  );

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
          String(value ?? "").trim().toLowerCase() ===
          code,
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

  return {
    organizerEvents,
    eventId,
    setEventId,
    scannerActive,
    setScannerActive,
    manualCode,
    setManualCode,
    search,
    setSearch,
    gate,
    setGate,
    isSubmitting,
    result,
    setResult,
    scannerInputRef,
    workspace,
    filteredGuests,
    attendancePercentage,
    submitCode,
    performCheckIn,
    handleManualSubmit,
    handleScannerSubmit,
    handleUndo,
  };
}
