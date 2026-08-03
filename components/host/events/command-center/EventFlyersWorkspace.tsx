"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  CircleAlert,
  Copy,
  Download,
  ImageIcon,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useEventCommandCenter } from "./EventCommandCenter";

type CampaignStatus = "draft" | "ready" | "posted";

const campaignStatuses: CampaignStatus[] = [
  "draft",
  "ready",
  "posted",
];

export default function EventFlyersWorkspace() {
  const { event, capabilities } = useEventCommandCenter();
  const canManageMarketing = capabilities.includes(
    "manage_marketing"
  );
  const creatives = useQuery(
    api.eventCreative.listByEvent,
    canManageMarketing ? { eventId: event._id } : "skip"
  );
  const updateStatus = useMutation(
    api.eventCreative.updateStatus
  );
  const removeCreative = useMutation(
    api.eventCreative.remove
  );
  const [pendingId, setPendingId] =
    useState<Id<"eventCreative"> | null>(null);
  const [actionError, setActionError] = useState("");
  const items = useMemo(
    () => creatives ?? [],
    [creatives]
  );
  const counts = useMemo(
    () => ({
      draft: items.filter(
        (item) =>
          (item.campaignStatus ?? "draft") === "draft"
      ).length,
      ready: items.filter(
        (item) => item.campaignStatus === "ready"
      ).length,
      posted: items.filter(
        (item) => item.campaignStatus === "posted"
      ).length,
    }),
    [items]
  );

  if (!canManageMarketing) {
    return (
      <section className="mx-auto max-w-2xl rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 p-7 text-center">
        <CircleAlert className="mx-auto h-8 w-8 text-orange-300" />
        <h2 className="mt-4 text-xl font-black">
          Marketing access required
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Ask an event owner or admin for marketing access to manage this event’s creative.
        </p>
      </section>
    );
  }

  async function changeStatus(
    id: Id<"eventCreative">,
    campaignStatus: CampaignStatus
  ) {
    try {
      setActionError("");
      setPendingId(id);
      await updateStatus({ id, campaignStatus });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The campaign status could not be updated."
      );
    } finally {
      setPendingId(null);
    }
  }

  async function remove(id: Id<"eventCreative">) {
    if (!window.confirm("Delete this creative asset?")) {
      return;
    }

    try {
      setActionError("");
      setPendingId(id);
      await removeCreative({ id });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The creative asset could not be deleted."
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
      <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-[#171128] via-[#0f0d17] to-[#17100d] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">
              Event marketing
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Flyers and campaign creative
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Create, review, publish, and download visual assets for {event.name}.
            </p>
          </div>

          <Link
            href={`/host/flyer-studio-v2?eventId=${event._id}`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-5 text-xs font-black shadow-[0_0_30px_rgba(124,58,237,0.24)] transition hover:scale-[1.01]"
          >
            <Sparkles className="h-4 w-4" />
            Create event flyer
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CreativeStat
          label="All assets"
          value={creatives?.length}
          tone="violet"
        />
        <CreativeStat
          label="Drafts"
          value={creatives ? counts.draft : undefined}
          tone="neutral"
        />
        <CreativeStat
          label="Ready"
          value={creatives ? counts.ready : undefined}
          tone="orange"
        />
        <CreativeStat
          label="Posted"
          value={creatives ? counts.posted : undefined}
          tone="emerald"
        />
      </section>

      {actionError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-xs leading-5 text-red-100/80">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
          {actionError}
        </div>
      ) : null}

      {creatives === undefined ? (
        <section className="grid animate-pulse gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[390px] rounded-[1.75rem] bg-white/[0.035]"
            />
          ))}
        </section>
      ) : items.length === 0 ? (
        <EmptyCreative eventId={event._id} />
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((creative) => (
            <CreativeCard
              key={creative._id}
              creative={creative}
              pending={pendingId === creative._id}
              onStatusChange={changeStatus}
              onRemove={remove}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function CreativeCard({
  creative,
  pending,
  onStatusChange,
  onRemove,
}: {
  creative: Doc<"eventCreative">;
  pending: boolean;
  onStatusChange: (
    id: Id<"eventCreative">,
    status: CampaignStatus
  ) => Promise<void>;
  onRemove: (id: Id<"eventCreative">) => Promise<void>;
}) {
  const status = campaignStatuses.includes(
    creative.campaignStatus as CampaignStatus
  )
    ? (creative.campaignStatus as CampaignStatus)
    : "draft";

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 shadow-[0_30px_100px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-violet-400/20">
      {creative.imageUrl ? (
        <div
          role="img"
          aria-label={creative.title ?? "Event creative"}
          className="aspect-[16/10] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(8, 7, 14, 0.35), transparent), url("${creative.imageUrl}")`,
          }}
        />
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-gradient-to-br from-violet-600/15 via-black to-orange-500/10">
          <ImageIcon className="h-8 w-8 text-zinc-700" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-white">
              {creative.title || "Event Flyer"}
            </h3>
            <p className="mt-1 text-[10px] font-bold text-zinc-600">
              {creative.style || "OutsideCrowd"} · {formatCreativeDate(creative)}
            </p>
          </div>
          <StatusPill status={status} />
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-zinc-500">
          {creative.prompt ||
            "Campaign creative saved for this event."}
        </p>

        <div className="mt-5 flex rounded-xl border border-white/[0.07] bg-black/30 p-1">
          {campaignStatuses.map((option) => (
            <button
              key={option}
              type="button"
              disabled={pending}
              onClick={() =>
                onStatusChange(creative._id, option)
              }
              className={`min-h-9 flex-1 rounded-lg px-2 text-[9px] font-black uppercase tracking-[0.12em] transition disabled:opacity-40 ${
                status === option
                  ? "bg-white text-black"
                  : "text-zinc-600 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {creative.caption ? (
            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(
                  creative.caption ?? ""
                )
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[10px] font-black text-zinc-400 transition hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              Caption
            </button>
          ) : null}

          {creative.imageUrl ? (
            <a
              href={creative.imageUrl}
              download
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[10px] font-black text-zinc-400 transition hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          ) : null}

          <button
            type="button"
            disabled={pending}
            onClick={() => onRemove(creative._id)}
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-400/10 bg-red-400/[0.05] px-3 text-[10px] font-black text-red-300/70 transition hover:bg-red-400/10 hover:text-red-200 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function CreativeStat({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone: "violet" | "orange" | "emerald" | "neutral";
}) {
  const tones = {
    violet: "text-violet-200",
    orange: "text-orange-200",
    emerald: "text-emerald-200",
    neutral: "text-white",
  };

  return (
    <article className="rounded-[1.5rem] border border-white/[0.08] bg-[#0c0b14]/90 p-5">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      {value === undefined ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-white/[0.05]" />
      ) : (
        <p className={`mt-2 text-2xl font-black ${tones[tone]}`}>
          {value.toLocaleString()}
        </p>
      )}
    </article>
  );
}

function StatusPill({ status }: { status: CampaignStatus }) {
  const classes = {
    draft:
      "border-zinc-400/15 bg-zinc-400/[0.07] text-zinc-400",
    ready:
      "border-orange-400/15 bg-orange-400/[0.08] text-orange-200",
    posted:
      "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.13em] ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function EmptyCreative({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-white/[0.1] bg-[#0c0b14]/70 px-6 py-16 text-center">
      <Sparkles className="mx-auto h-9 w-9 text-violet-300" />
      <h3 className="mt-5 text-xl font-black">
        Build the first campaign asset
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Start with an AI-generated flyer, then save it here for review and publishing.
      </p>
      <Link
        href={`/host/flyer-studio-v2?eventId=${eventId}`}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-xs font-black text-black"
      >
        Open Flyer Studio
      </Link>
    </section>
  );
}

function formatCreativeDate(
  creative: Doc<"eventCreative">
): string {
  const timestamp =
    creative.updatedAt ??
    creative.createdAt ??
    creative._creationTime;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}
