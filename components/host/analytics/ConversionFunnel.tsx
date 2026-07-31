export type FunnelStage = {
  key: string;
  label: string;
  value: number;
};

export type OrganizerFunnel = {
  periodDays: number;
  purchaseRate: number;
  checkInRate: number;
  stages: FunnelStage[];
};

type ConversionFunnelProps = {
  funnel: OrganizerFunnel;
};

const stageStyles = [
  {
    bar: "bg-violet-400",
    glow: "shadow-[0_0_24px_rgba(167,139,250,0.22)]",
    number: "text-violet-200",
  },
  {
    bar: "bg-orange-400",
    glow: "shadow-[0_0_24px_rgba(251,146,60,0.22)]",
    number: "text-orange-200",
  },
  {
    bar: "bg-emerald-400",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.22)]",
    number: "text-emerald-200",
  },
];

export default function ConversionFunnel({
  funnel,
}: ConversionFunnelProps) {
  const maximum = Math.max(
    1,
    ...funnel.stages.map((stage) => stage.value)
  );

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
            Conversion funnel
          </p>

          <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
            Views to attendance
          </h2>
        </div>

        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
          Last {funnel.periodDays} days
        </span>
      </div>

      <div className="mt-7 space-y-5">
        {funnel.stages.map((stage, index) => {
          const style =
            stageStyles[index] ??
            stageStyles[stageStyles.length - 1];
          const width =
            stage.value === 0
              ? 0
              : Math.max(
                  8,
                  Math.round(
                    (stage.value / maximum) * 100
                  )
                );

          return (
            <div key={stage.key}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-zinc-300">
                    {stage.label}
                  </p>

                  {index > 0 ? (
                    <p className="mt-1 text-[10px] font-bold text-zinc-600">
                      {getStageConversion(
                        stage.value,
                        funnel.stages[index - 1]?.value ?? 0
                      )}
                      % from previous stage
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] font-bold text-zinc-600">
                      Deduplicated event sessions
                    </p>
                  )}
                </div>

                <p
                  className={`text-2xl font-black tabular-nums ${style.number}`}
                >
                  {stage.value.toLocaleString()}
                </p>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${style.bar} ${style.glow}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-5">
        <RateCard
          label="View → buyer"
          value={funnel.purchaseRate}
          classes="text-orange-200"
        />

        <RateCard
          label="Buyer → check-in"
          value={funnel.checkInRate}
          classes="text-emerald-200"
        />
      </div>
    </section>
  );
}

function getStageConversion(
  current: number,
  previous: number
): number {
  if (previous <= 0) {
    return 0;
  }

  return (
    Math.round((current / previous) * 1_000) / 10
  );
}

function RateCard({
  label,
  value,
  classes,
}: {
  label: string;
  value: number;
  classes: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/30 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black tabular-nums ${classes}`}
      >
        {value.toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })}
        %
      </p>
    </div>
  );
}
