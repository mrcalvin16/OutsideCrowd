import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CircleCheck,
  Info,
  type LucideIcon,
} from "lucide-react";

export type DashboardNotification = {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: "urgent" | "warning" | "info" | "success";
};

type NotificationCenterProps = {
  notifications: DashboardNotification[] | undefined;
};

const severityStyles: Record<
  DashboardNotification["severity"],
  {
    icon: LucideIcon;
    classes: string;
  }
> = {
  urgent: {
    icon: AlertTriangle,
    classes:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    classes:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  info: {
    icon: Info,
    classes:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },
  success: {
    icon: CircleCheck,
    classes:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
};

export default function NotificationCenter({
  notifications,
}: NotificationCenterProps) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0c0b14]/80 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
            Attention Queue
          </p>

          <h2 className="mt-2 text-xl font-black tracking-tight">
            Notifications
          </h2>
        </div>

        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10 text-orange-300">
          <BellRing className="h-4 w-4" />
        </span>
      </div>

      {notifications === undefined ? (
        <div className="space-y-3 p-5">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-[78px] animate-pulse rounded-2xl bg-white/[0.04]"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <CircleCheck className="h-5 w-5" />
          </span>

          <p className="mt-4 font-black text-white">
            You’re all clear
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            No event-readiness issues need attention.
          </p>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {notifications.map((notification) => {
            const style = severityStyles[notification.severity];
            const Icon = style.icon;

            return (
              <Link
                key={notification.id}
                href={notification.href}
                className="group flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-3.5 transition hover:border-white/[0.14] hover:bg-white/[0.035]"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${style.classes}`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black text-white">
                    {notification.title}
                  </span>

                  <span className="mt-1 block text-[10px] leading-4 text-zinc-500">
                    {notification.detail}
                  </span>
                </span>

                <span className="pt-2 text-xs font-black text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-white">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
