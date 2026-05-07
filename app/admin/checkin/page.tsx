"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { api } from "@/convex/_generated/api";

export default function AdminCheckInPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const ticketData = useQuery(
    api.tickets.getTicketForCheckIn,
    qrCode ? { qrCode } : "skip"
  );

  const checkInTicket = useMutation(api.tickets.checkInTicket);

  async function startScanner() {
    setMessage("");
    setStatus("idle");
    setIsScanning(true);

    const codeReader = new BrowserMultiFormatReader();

    try {
      await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result) => {
          if (result) {
            const scannedText = result.getText();
            setQrCode(scannedText);
            setIsScanning(false);
          }
        }
      );
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Could not start camera scanner.");
      setIsScanning(false);
    }
  }

  async function handleCheckIn() {
    if (!qrCode.trim()) {
      setStatus("error");
      setMessage("Enter or scan a QR code first.");
      return;
    }

    try {
      const result = await checkInTicket({ qrCode });

      setStatus("success");
      setMessage(result.message);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Check-in failed.");
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            OutsideCrowd Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold">Ticket Check-In</h1>
          <p className="mt-3 text-zinc-400">
            Scan a ticket QR code or paste the QR code value below to validate
            and check in guests.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
          <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            <video
              ref={videoRef}
              className="h-72 w-full object-cover"
              muted
              playsInline
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={startScanner}
              disabled={isScanning}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isScanning ? "Scanning..." : "Start Camera Scan"}
            </button>

            <button
              onClick={handleCheckIn}
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
            >
              Check In Ticket
            </button>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-zinc-400">
              QR Code Value
            </label>
            <input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Paste QR code value here"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          {ticketData && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Ticket Found</p>
              <h2 className="mt-1 text-xl font-semibold">
                {ticketData.event?.name || "Unknown Event"}
              </h2>

              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                <p>
                  Status:{" "}
                  <span
                    className={
                      ticketData.ticket.checkedIn
                        ? "font-semibold text-yellow-400"
                        : "font-semibold text-emerald-400"
                    }
                  >
                    {ticketData.ticket.checkedIn
                      ? "Already Checked In"
                      : "Valid / Not Checked In"}
                  </span>
                </p>

                {ticketData.ticket.checkedInAt && (
                  <p>
                    Checked in at:{" "}
                    {new Date(ticketData.ticket.checkedInAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mt-6 rounded-2xl p-4 text-sm font-medium ${
                status === "success"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}