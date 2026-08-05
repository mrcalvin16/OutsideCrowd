"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  Copy,
  Download,
  Files,
  ImageIcon,
  Palette,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

const filters = [
  "all",
  "linked",
  "unlinked",
  "draft",
  "ready",
  "posted",
] as const;
const statuses = ["draft", "ready", "posted"] as const;
type Filter = (typeof filters)[number];

export default function CreativeLibraryPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const creatives = useQuery(
    api.eventCreative.listMine,
    isLoaded && isSignedIn ? {} : "skip",
  );
  const updateStatus = useMutation(api.eventCreative.updateStatus);
  const duplicateCreative = useMutation(api.eventCreative.duplicate);
  const removeCreative = useMutation(api.eventCreative.remove);
  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string>();

  const visible = useMemo(
    () =>
      (creatives ?? []).filter((item) => {
        if (filter === "linked") return Boolean(item.sourceEventId);
        if (filter === "unlinked") return !item.sourceEventId;
        if (statuses.includes(filter as (typeof statuses)[number]))
          return (item.campaignStatus ?? "draft") === filter;
        return true;
      }),
    [creatives, filter],
  );

  async function copyCaption(item: Doc<"eventCreative">) {
    if (!item.caption) return;
    await navigator.clipboard.writeText(item.caption);
    setMessage("Caption copied to clipboard.");
  }

  async function duplicate(item: Doc<"eventCreative">) {
    setBusyId(String(item._id));
    setMessage("");
    try {
      await duplicateCreative({ id: item._id });
      setMessage("Creative duplicated.");
    } finally {
      setBusyId(undefined);
    }
  }

  async function remove(item: Doc<"eventCreative">) {
    if (!window.confirm(`Delete ${item.title || "this creative"}?`)) return;
    setBusyId(String(item._id));
    setMessage("");
    try {
      await removeCreative({ id: item._id });
      setMessage("Creative deleted.");
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-400">
            Marketing assets
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Creative Library
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Manage flyer assets, captions, and campaign readiness.
          </p>
        </div>
        <Link
          href="/host/flyer-studio-v2"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-5 text-xs font-black"
        >
          <Palette className="h-4 w-4" /> Create campaign
        </Link>
      </div>
      {creatives?.length ? (
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Assets" value={creatives.length} />
          <Metric
            label="Caption ready"
            value={creatives.filter((item) => item.caption).length}
          />
          <Metric
            label="Published"
            value={
              creatives.filter((item) => item.campaignStatus === "posted")
                .length
            }
          />
        </section>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-300">
          {message}
        </p>
      ) : null}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-xs font-black capitalize ${filter === item ? "bg-white text-black" : "border border-white/[.08] text-zinc-500"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {!isLoaded || creatives === undefined ? (
        <div className="mt-5 h-72 animate-pulse rounded-2xl bg-white/[.03]" />
      ) : !isSignedIn ? (
        <Empty title="Sign in to view your creative library" />
      ) : !visible.length ? (
        <Empty
          title={
            creatives.length
              ? "No assets match this filter"
              : "No saved creative yet"
          }
        />
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <article
              key={item._id}
              className="overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.035]"
            >
              <div className="aspect-[16/10] bg-white/[.025]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title || "Saved creative"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-9 w-9 text-zinc-800" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black">
                      {item.title || "Event Flyer"}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-600">
                      {item.style || "Custom"} ·{" "}
                      {item.sourceEventId ? "Linked" : "Unlinked"}
                    </p>
                  </div>
                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[9px] font-black uppercase text-violet-300">
                    {item.campaignStatus || "draft"}
                  </span>
                </div>
                {item.caption ? (
                  <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-500">
                    {item.caption}
                  </p>
                ) : null}
                <div className="mt-4 flex gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        updateStatus({ id: item._id, campaignStatus: status })
                      }
                      className={`min-h-9 flex-1 rounded-lg text-[9px] font-black uppercase ${item.campaignStatus === status || (!item.campaignStatus && status === "draft") ? "bg-orange-400/15 text-orange-200" : "border border-white/[.07] text-zinc-600"}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/host/flyer-studio-v2?creative=${item._id}`}
                    className="rounded-lg border border-white/[.08] px-3 py-2 text-[10px] font-black"
                  >
                    Edit
                  </Link>
                  {item.imageUrl ? (
                    <a
                      href={item.imageUrl}
                      download
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[.08] px-3 py-2 text-[10px] font-black"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  ) : null}
                  {item.caption ? (
                    <button
                      type="button"
                      onClick={() => copyCaption(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[.08] px-3 py-2 text-[10px] font-black"
                    >
                      <Copy className="h-3 w-3" /> Caption
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === String(item._id)}
                    onClick={() => duplicate(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[.08] px-3 py-2 text-[10px] font-black disabled:opacity-40"
                  >
                    <Files className="h-3 w-3" /> Duplicate
                  </button>
                  <button
                    type="button"
                    disabled={busyId === String(item._id)}
                    onClick={() => remove(item)}
                    className="ml-auto rounded-lg border border-red-400/15 p-2 text-red-300 disabled:opacity-40"
                    aria-label={`Delete ${item.title || "creative"}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[.08] bg-white/[.035] p-4">
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
function Empty({ title }: { title: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      <ImageIcon className="mx-auto h-8 w-8 text-zinc-700" />
      <p className="mt-4 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs text-zinc-600">
        Create or save a flyer in Flyer Studio to add it here.
      </p>
    </div>
  );
}
