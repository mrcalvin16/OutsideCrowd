"use client";

export default function NotificationPulse() {
  return (
    <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 backdrop-blur-xl">
      <div className="relative">
        <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
        <div className="absolute inset-0 animate-ping rounded-full bg-orange-400/70" />
      </div>

      <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-white/55">
        Live signals
      </div>
    </div>
  );
}
