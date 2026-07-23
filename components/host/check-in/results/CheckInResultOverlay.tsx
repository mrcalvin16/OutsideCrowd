"use client";

export type CheckInResult = {
  status: "success" | "duplicate" | "error";
  guestName: string;
  ticketType: string;
  quantity: number;
  message?: string;
  checkedInAt?: number;
};

type CheckInResultOverlayProps = {
  result: CheckInResult;
  onClose: () => void;
};

export default function CheckInResultOverlay({
  result,
  onClose,
}: CheckInResultOverlayProps) {
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

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
