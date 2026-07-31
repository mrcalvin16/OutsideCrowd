import { Ticket } from "lucide-react";

export type TicketTypePerformanceItem = {
  label: string;
  tickets: number;
  revenue: number;
};

export default function TicketTypePerformance({
  items,
}: {
  items: TicketTypePerformanceItem[];
}) {
  const useRevenue = items.some(
    (item) => item.revenue > 0
  );
  const maximum = Math.max(
    1,
    ...items.map((item) =>
      useRevenue ? item.revenue : item.tickets
    )
  );

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">
            Product mix
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
            Ticket performance
          </h2>
        </div>

        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-400/15 bg-violet-400/[0.08] text-violet-200">
          <Ticket className="h-4 w-4" />
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-white/[0.09] px-5 py-12 text-center">
          <p className="text-sm font-bold text-zinc-400">
            No ticket sales in this period
          </p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
            Paid ticket types will rank here as sales arrive.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          {items.map((item, index) => {
            const value = useRevenue
              ? item.revenue
              : item.tickets;
            const width = Math.max(
              5,
              Math.round((value / maximum) * 100)
            );

            return (
              <div key={item.label}>
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-zinc-300">
                      <span className="mr-2 text-zinc-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-zinc-600">
                      {item.tickets.toLocaleString()} tickets
                    </p>
                  </div>

                  <p className="text-sm font-black tabular-nums text-orange-200">
                    {formatMoney(item.revenue)}
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-orange-400 shadow-[0_0_20px_rgba(167,139,250,0.2)]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(value);
}
