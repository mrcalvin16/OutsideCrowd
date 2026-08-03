"use client";

import { CloudOff, RefreshCw, Wifi } from "lucide-react";

export default function OfflineQueueStatus({
  isOnline,
  queuedCount,
  isSyncing,
}: {
  isOnline: boolean;
  queuedCount: number;
  isSyncing: boolean;
}) {
  if (isOnline && queuedCount === 0) return null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        isOnline
          ? "border-blue-400/20 bg-blue-400/[0.08]"
          : "border-amber-400/20 bg-amber-400/[0.08]"
      }`}
      role="status"
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-blue-300" />
        ) : (
          <CloudOff className="h-4 w-4 text-amber-300" />
        )}
        <div>
          <p className="text-xs font-black text-white">
            {isOnline ? "Connection restored" : "Offline mode active"}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {queuedCount > 0
              ? `${queuedCount} check-in${queuedCount === 1 ? "" : "s"} waiting to sync`
              : "Scans will be securely queued on this device"}
          </p>
        </div>
      </div>

      {isSyncing ? (
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-blue-200">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Syncing
        </span>
      ) : null}
    </div>
  );
}
