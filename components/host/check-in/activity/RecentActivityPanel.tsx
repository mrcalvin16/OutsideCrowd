"use client";

export type RecentActivityItem = {
  _id: string;
  guestName: string;
  ticketType: string;
  method: string;
  gate: string;
  quantity: number;
  checkedInAt: number;
};

type RecentActivityPanelProps = {
  recentActivity: RecentActivityItem[];
  formatMethod: (value: string) => string;
  formatTime: (value: number) => string;
};

export default function RecentActivityPanel({
  recentActivity,
  formatMethod,
  formatTime,
}: RecentActivityPanelProps) {
  return (
            <aside className="rounded-3xl border border-white/10 bg-zinc-950 xl:sticky xl:top-6 xl:h-fit">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-white">
                      Recent activity
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      Live entry history
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Live
                  </span>
                </div>
              </div>

              {recentActivity.length > 0 ? (
                <div className="max-h-[760px] divide-y divide-white/10 overflow-y-auto">
                  {recentActivity.map((item: RecentActivityItem) => (
                    <div key={item._id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {item.guestName}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {item.ticketType}
                            {" · "}
                            {formatMethod(item.method)}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {item.gate}
                            {item.quantity > 1
                              ? ` · ${item.quantity} guests`
                              : ""}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-black text-emerald-300">
                            ✓
                          </span>

                          <p className="mt-2 text-xs font-semibold text-zinc-500">
                            {formatTime(item.checkedInAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="font-bold text-white">
                    No check-ins yet
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Successful entries will appear here.
                  </p>
                </div>
              )}
            </aside>
  );
}
