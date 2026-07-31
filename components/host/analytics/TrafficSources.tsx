export type TrafficSourceItem = {
  key: string;
  label: string;
  value: number;
};

type TrafficSourcesProps = {
  sources: TrafficSourceItem[];
  periodDays: number;
};

const sourceColors: Record<string, string> = {
  direct: "bg-violet-400",
  instagram: "bg-fuchsia-400",
  tiktok: "bg-cyan-300",
  facebook: "bg-blue-400",
  search: "bg-emerald-400",
  email: "bg-amber-300",
  referral: "bg-orange-400",
};

export default function TrafficSources({
  sources,
  periodDays,
}: TrafficSourcesProps) {
  const rankedSources = [...sources].sort(
    (a, b) => b.value - a.value
  );
  const total = rankedSources.reduce(
    (sum, source) => sum + source.value,
    0
  );
  const topSource = rankedSources.find(
    (source) => source.value > 0
  );

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">
            Acquisition
          </p>

          <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
            Traffic sources
          </h2>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black tabular-nums text-white">
            {total.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
            {periodDays}-day views
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-white/[0.09] px-5 py-12 text-center">
          <p className="text-sm font-bold text-zinc-400">
            No attributed traffic yet
          </p>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
            New event visits will be classified from UTM tags and referring sites automatically.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {rankedSources.map((source) => {
            const percentage =
              total > 0
                ? Math.round(
                    (source.value / total) * 1_000
                  ) / 10
                : 0;

            return (
              <div key={source.key}>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        sourceColors[source.key] ??
                        "bg-zinc-400"
                      }`}
                    />
                    <span className="font-black text-zinc-300">
                      {source.label}
                    </span>
                  </div>

                  <p className="font-bold tabular-nums text-zinc-500">
                    {source.value.toLocaleString()}
                    <span className="ml-2 text-zinc-700">
                      {percentage}%
                    </span>
                  </p>
                </div>

                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      sourceColors[source.key] ??
                      "bg-zinc-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-7 border-t border-white/[0.07] pt-4 text-xs text-zinc-600">
        {topSource ? (
          <p>
            <span className="font-black text-zinc-400">
              {topSource.label}
            </span>{" "}
            is currently your strongest discovery channel.
          </p>
        ) : (
          <p>Source attribution begins with the next event view.</p>
        )}
      </div>
    </section>
  );
}
