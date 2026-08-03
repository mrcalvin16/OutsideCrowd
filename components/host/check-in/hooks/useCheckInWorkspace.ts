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
import { useCheckInFeedback } from "./useCheckInFeedback";

type CheckInMethod = "qr" | "manual" | "search";

type OfflineQueueItem = {
  eventId: Id<"events">;
  ticketId: Id<"tickets">;
  method: CheckInMethod;
  gate: string;
  queuedAt: number;
};

const OFFLINE_QUEUE_KEY = "outsidecrowd:offline-check-ins";

export function useCheckInWorkspace(
  initialEventId?: Id<"events">
) {
  const organizerEvents = useQuery(
    api.checkIn.getOrganizerEvents,
  );

  const [eventId, setEventId] =
    useState<Id<"events"> | null>(
      initialEventId ?? null
    );
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [search, setSearch] = useState("");
  const [gate, setGate] = useState("Main Gate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [result, setResult] =
    useState<CheckInResult | null>(null);
  const feedback = useCheckInFeedback();

  const scannerInputRef = useRef<HTMLInputElement>(null);
  const syncingQueueRef = useRef(false);

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
    setIsOnline(window.navigator.onLine);

    try {
      const stored = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineQueueItem[];
        if (Array.isArray(parsed)) setOfflineQueue(parsed.slice(0, 500));
      }
    } catch {
      window.localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline || offlineQueue.length === 0 || syncingQueueRef.current) {
      return;
    }

    syncingQueueRef.current = true;
    setIsSyncingQueue(true);

    async function flushQueue() {
      for (const item of offlineQueue) {
        if (!window.navigator.onLine) break;

        try {
          await checkInTicket({
            eventId: item.eventId,
            ticketId: item.ticketId,
            method: item.method,
            gate: item.gate,
          });
          setOfflineQueue((current) =>
            persistOfflineQueue(
              current.filter(
                (queued) =>
                  queued.eventId !== item.eventId ||
                  queued.ticketId !== item.ticketId
              )
            )
          );
        } catch {
          break;
        }
      }

      syncingQueueRef.current = false;
      setIsSyncingQueue(false);
    }

    void flushQueue();
  }, [checkInTicket, isOnline, offlineQueue]);

  useEffect(() => {
    if (
      initialEventId &&
      initialEventId !== eventId
    ) {
      setEventId(initialEventId);
    }
  }, [eventId, initialEventId]);

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

    if (result.status === "success" || result.status === "queued") {
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

    if (!window.navigator.onLine) {
      const guest = workspace?.guests.find(
        (item) => item.ticketId === ticketId
      );
      const alreadyQueued = offlineQueue.some(
        (item) =>
          item.eventId === eventId && item.ticketId === ticketId
      );

      if (!alreadyQueued) {
        setOfflineQueue((current) =>
          persistOfflineQueue([
            ...current,
            { eventId, ticketId, method, gate, queuedAt: Date.now() },
          ])
        );
      }

      setResult({
        status: "queued",
        guestName: guest?.name ?? "Guest",
        ticketType: guest?.ticketType ?? "Admission",
        quantity: guest?.quantity ?? 1,
        message: alreadyQueued
          ? "This check-in is already waiting to sync."
          : "Saved on this device and waiting for a connection.",
      });
      feedback.playFeedback("success");
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
      feedback.playFeedback(response.status);
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
      feedback.playFeedback("error");
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

  function handleEventChange(
    nextEventId: Id<"events">,
  ) {
    setEventId(nextEventId);
    setResult(null);
    setSearch("");
    setManualCode("");
  }

  function handleCameraError(message: string) {
    setResult({
      status: "error",
      guestName: "Camera unavailable",
      ticketType: "",
      quantity: 0,
      message,
    });
  }

  function handleResultClose() {
    setResult(null);
    scannerInputRef.current?.focus();
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
    isOnline,
    offlineQueueCount: offlineQueue.length,
    isSyncingQueue,
    result,
    setResult,
    scannerInputRef,
    workspace,
    filteredGuests,
    attendancePercentage,
    ...feedback,
    submitCode,
    performCheckIn,
    handleManualSubmit,
    handleScannerSubmit,
    handleUndo,
    handleEventChange,
    handleCameraError,
    handleResultClose,
  };
}

function persistOfflineQueue(queue: OfflineQueueItem[]) {
  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return queue;
}
