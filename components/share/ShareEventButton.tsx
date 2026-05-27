"use client";

import { useState } from "react";

interface Props {
  eventId: string;
  title?: string;
  location?: string;
}

export default function ShareEventButton({
  eventId,
  title = "Check out this event",
  location,
}: Props) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${eventId}`
      : "";

  const shareText = `${title}${location ? ` • ${location}` : ""}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSMS = () => {
    window.location.href = `sms:?&body=${encodeURIComponent(
      shareText + " " + url
    )}`;
  };

  const shareEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(shareText + "\n\n" + url)}`;
  };

  const shareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`,
      "_blank"
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
        Share Event
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={copyLink}
          className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black hover:bg-orange-100"
        >
          {copied ? "Copied" : "Copy Link"}
        </button>

        <button
          onClick={shareSMS}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
        >
          Text
        </button>

        <button
          onClick={shareEmail}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
        >
          Email
        </button>

        <button
          onClick={shareX}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
        >
          X
        </button>

        <button
          onClick={shareWhatsApp}
          className="col-span-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
}
