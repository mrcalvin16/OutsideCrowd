"use client";

import { Gauge, MapPin, ScanLine, Zap } from "lucide-react";

type GateThroughputItem = {
  gate: string;
  checkIns: number;
  share: number;
  averagePerMinute: number;
  peakPerMinute: number;
};

export default function GateThroughput({
  items,
}: {
  items: GateThroughputItem[];
}) {
  const busiestGate = items[0];

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-orange-300" />
            <h3 className="text-base font-black">Throughput by gate</h3>
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            Entry volume and scanning pace during this reporting window.
          </p>
        </div>

        {busiestGate ? (
          <div className="rounded-xl border border-orange-400/15 bg-orange-400/[0.07] px-3 py-2 text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-orange-300/70">
              Busiest gate
            </p>
            <p className="mt-1 text-xs font-black text-orange-100">
              {busiestGate.gate}
            </p>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <ScanLine className="mx-auto h-7 w-7 text-zinc-700" />
          <p className="mt-3 text-sm font-black text-zinc-400">
            No gate activity yet
          </p>
          <p className="mt-1 text-xs text-zinc-700">
            Gate performance appears after attendees begin checking in.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {items.map((item) => (
            <article key={item.gate} className="px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-black">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-300" />
                    {item.gate}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-orange-400"
                      style={{ width: `${Math.min(100, item.share)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:min-w-[390px]">
                  <GateMetric label="Check-ins" value={item.checkIns} />
                  <GateMetric
                    label="Avg / min"
                    value={item.averagePerMinute}
                  />
                  <GateMetric
                    label="Peak / min"
                    value={item.peakPerMinute}
                    icon
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function GateMetric({
  label,
  value,
  icon = false,
}: {
  label: string;
  value: number;
  icon?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-zinc-700">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1 text-sm font-black tabular-nums">
        {icon ? <Zap className="h-3 w-3 text-orange-300" /> : null}
        {value.toLocaleString()}
      </p>
    </div>
  );
}
