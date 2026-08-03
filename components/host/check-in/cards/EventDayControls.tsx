"use client";

import {
  Gauge,
  MapPin,
  ScanLine,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

type Throughput = {
  lastFiveMinutes: number;
  lastFifteenMinutes: number;
  perMinute: number;
  activeGates: number;
  busiestGate: string | null;
  busiestGateCheckIns: number;
  isLimited: boolean;
};

export default function EventDayControls({
  scannerActive,
  currentGate,
  throughput,
  isOnline,
  onScannerActiveChange,
}: {
  scannerActive: boolean;
  currentGate: string;
  throughput: Throughput;
  isOnline: boolean;
  onScannerActiveChange: (active: boolean) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-orange-400/15 bg-gradient-to-br from-orange-400/[0.09] via-zinc-950 to-violet-500/[0.08]">
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1.15fr_repeat(3,minmax(0,.62fr))]">
        <button
          type="button"
          onClick={() => onScannerActiveChange(!scannerActive)}
          className={`flex min-h-20 items-center justify-between rounded-2xl px-5 text-left transition active:scale-[0.99] ${
            scannerActive
              ? "bg-emerald-400 text-black shadow-[0_0_30px_rgba(52,211,153,0.18)]"
              : "bg-orange-400 text-black shadow-[0_0_30px_rgba(251,146,60,0.18)]"
          }`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-65">
              {currentGate}
            </p>
            <p className="mt-1 text-lg font-black">
              {scannerActive ? "Scanner ready" : "Open scanner"}
            </p>
          </div>
          <ScanLine className="h-7 w-7" />
        </button>

        <LiveMetric
          label="Entry pace"
          value={`${throughput.perMinute}/min`}
          detail={`${throughput.lastFiveMinutes} in 5 min`}
          icon={Gauge}
        />
        <LiveMetric
          label="15-min arrivals"
          value={throughput.lastFifteenMinutes.toLocaleString()}
          detail="Rolling window"
          icon={Users}
        />
        <LiveMetric
          label="Active gates"
          value={throughput.activeGates.toLocaleString()}
          detail={
            throughput.busiestGate
              ? `${throughput.busiestGate} leads`
              : "No recent entries"
          }
          icon={MapPin}
        />
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 text-[10px] font-bold text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-emerald-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-amber-400" />
          )}
          {isOnline ? "Live sync connected" : "Offline queue active"}
        </span>
        <span>Last 60 minutes</span>
      </div>
    </section>
  );
}

function LiveMetric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Gauge;
}) {
  return (
    <div className="min-h-20 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-600">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 text-orange-300" />
      </div>
      <p className="mt-2 text-xl font-black tabular-nums text-white">
        {value}
      </p>
      <p className="mt-1 truncate text-[9px] font-bold text-zinc-600">
        {detail}
      </p>
    </div>
  );
}
