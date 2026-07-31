import { ReceiptText } from "lucide-react";

export type RecentEventSale = {
  id: string;
  ticketId: string;
  buyerEmail: string;
  ticketType: string;
  quantity: number;
  amount: number;
  occurredAt: number;
};

export default function RecentEventSales({
  sales,
}: {
  sales: RecentEventSale[];
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
            Buyer activity
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
            Recent sales
          </h2>
        </div>

        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-orange-400/15 bg-orange-400/[0.08] text-orange-200">
          <ReceiptText className="h-4 w-4" />
        </span>
      </div>

      {sales.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-white/[0.09] px-5 py-12 text-center">
          <p className="text-sm font-bold text-zinc-400">
            No recent sales
          </p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
            New paid orders will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-white/[0.06]">
          {sales.map((sale) => (
            <article
              key={sale.id}
              className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-zinc-300">
                  {sale.buyerEmail}
                </p>
                <p className="mt-1 truncate text-[10px] font-bold text-zinc-600">
                  {sale.ticketType} × {sale.quantity.toLocaleString()}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-black tabular-nums text-emerald-200">
                  {formatMoney(sale.amount)}
                </p>
                <time
                  dateTime={new Date(sale.occurredAt).toISOString()}
                  className="mt-1 block text-[9px] font-bold text-zinc-700"
                >
                  {formatSaleTime(sale.occurredAt)}
                </time>
              </div>
            </article>
          ))}
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

function formatSaleTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
