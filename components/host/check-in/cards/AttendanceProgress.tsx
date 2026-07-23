type AttendanceProgressProps = {
  eventName: string;
  dateString?: string;
  venueName?: string;
  location?: string;
  checkedIn: number;
  totalGuests: number;
  attendancePercentage: number;
};

export default function AttendanceProgress({
  eventName,
  dateString,
  venueName,
  location,
  checkedIn,
  totalGuests,
  attendancePercentage,
}: AttendanceProgressProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-black text-white">
              {eventName}
            </h2>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              Live
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {dateString || "Date not set"}
            {" · "}
            {venueName || location || "Venue not set"}
          </p>
        </div>

        <div className="min-w-0 lg:w-[360px]">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-400">
              Attendance progress
            </span>

            <span className="font-black text-white">
              {checkedIn} / {totalGuests}
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
  );
}
