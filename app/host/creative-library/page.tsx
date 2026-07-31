"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

const campaignStatuses = [
  "draft",
  "ready",
  "posted",
] as const;

export default function CreativeLibraryPage() {
  const { isLoaded, isSignedIn } = useAuth();

  const creatives = useQuery(
    api.eventCreative.listMine,
    isLoaded && isSignedIn ? {} : "skip",
  ) as any[] | undefined;

  const deleteCreative = useMutation(api.eventCreative.remove);
  const updateStatus = useMutation(api.eventCreative.updateStatus);
  const duplicateCreative = useMutation(api.eventCreative.duplicate);
  const removeCreative = useMutation(api.eventCreative.remove);

  const [filter, setFilter] = useState<
    "all" | "linked" | "unlinked" | "draft" | "ready" | "posted"
  >("all");

  async function copyCaption(value?: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    alert("Caption copied.");
  }

  const filteredCreatives = useMemo(() => {
    const list = creatives || [];

    if (filter === "linked") {
      return list.filter((item: any) => item.sourceEventId);
    }

    if (filter === "unlinked") {
      return list.filter((item: any) => !item.sourceEventId);
    }

    if (["draft", "ready", "posted"].includes(filter)) {
      return list.filter(
        (item: any) => (item.campaignStatus || "draft") === filter,
      );
    }

    return list;
  }, [creatives, filter]);

  return (
    <main className="safe-x min-h-screen overflow-hidden bg-black text-white">
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-violet-300/70">
                Host Command Center
              </p>

              <div className="mb-4">
                <a
                  href="/host"
                  className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white/70 hover:bg-white/10"
                >
                  ← Back to Organizer OS
                </a>
              </div>

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                    Creative Library
                  </h1>
                </div>

                <a
                  href="/host/flyer-studio"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-violet-500 px-6 py-3 text-center text-sm font-black text-white shadow-[0_0_40px_rgba(249,115,22,0.25)] hover:scale-[1.02]"
                >
                  Create New Campaign →
                </a>
              </div>

              <p className="mt-4 max-w-2xl text-white/60">
                Manage event flyers, captions, launch assets, and campaign
                drafts.
              </p>
            </div>

            <Link href="/host/flyer-studio" className="oc-button-primary">
              Open Flyer Studio
            </Link>
          </div>

          {creatives && creatives.length > 0 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CreativeStat label="Assets" value={String(creatives.length)} />
              <CreativeStat
                label="Caption Ready"
                value={String(creatives.filter((item) => item.caption).length)}
              />
              <CreativeStat
                label="Styles Used"
                value={String(
                  new Set(creatives.map((item) => item.style || "Luxury")).size,
                )}
              />
              <CreativeStat
                label="Latest Update"
                value={
                  creatives[0]?.updatedAt
                    ? new Date(creatives[0].updatedAt).toLocaleDateString()
                    : "N/A"
                }
              />
            </div>
          )}

          {!isLoaded ? (
            <div className="oc-card p-6 text-white/50">Loading...</div>
          ) : !isSignedIn ? (
            <div className="oc-card p-6 text-white/50">
              Sign in to view your creative library.
            </div>
          ) : creatives === undefined ? (
            <div className="oc-card p-6 text-white/50">
              Loading creative assets...
            </div>
          ) : creatives.length === 0 ? (
            <div className="oc-card p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-violet-300/70">
                Empty Library
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                No saved creative yet.
              </h2>

              <p className="mt-4 max-w-2xl text-white/55">
                Create a flyer in Flyer Studio and save it to an event.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {creatives.map((item) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-zinc-950"
                >
                  <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-28 w-28 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-orange-500/10" />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-black text-white">
                        {item.title || "Event Flyer"}
                      </h2>

                      <span className="rounded-full border border-violet-300/20 bg-gradient-to-r from-violet-500/20 to-orange-500/20 px-3 py-1 text-xs font-black text-violet-100">
                        {item.style || "Luxury"}
                      </span>
                    </div>

                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title || "Saved creative"}
                        className="mt-4 h-40 w-full rounded-2xl object-cover"
                      />
                    )}

                    {item.prompt && (
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/55">
                        {item.prompt}
                      </p>
                    )}

                    {item.sourceEventId && (
                      <p className="mb-3 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-100">
                        Linked Event Creative
                      </p>
                    )}

                    <div className="mb-3 flex flex-wrap gap-2">
                      {item.sourceEventId && (
                        <a
                          href={`/events/${item.sourceEventId}`}
                          className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-100 hover:bg-violet-500/20"
                        >
                          Open Event
                        </a>
                      )}

                      <a
                        href={`/host/flyer-studio?creative=${item._id}`}
                        className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100 hover:bg-orange-500/20"
                      >
                        Edit in Studio
                      </a>

                      {item.imageUrl && (
                        <a
                          href={item.imageUrl}
                          download={`outsidecrowd-${item.title || "creative"}.png`}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white/70 hover:bg-white/10"
                        >
                          Download
                        </a>
                      )}

                      <div className="mb-3 flex flex-wrap gap-2">
                        {campaignStatuses.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              updateStatus({
                                id: item._id,
                                campaignStatus: status,
                              })
                            }
                            className={`rounded-full border px-3 py-2 text-xs font-black capitalize ${
                              (item.campaignStatus || "draft") === status
                                ? "border-orange-300 bg-orange-500/15 text-orange-100"
                                : "border-white/10 bg-black/35 text-white/45 hover:bg-white/10"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="mb-4 flex items-center gap-2 text-xs text-white/35">
                        <div className="h-2 w-2 rounded-full bg-orange-400" />
                        <span>
                          {item.updatedAt
                            ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}`
                            : `Created ${new Date(item._creationTime).toLocaleDateString()}`}
                        </span>
                      </div>

                      {item.caption && (
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(item.caption)
                          }
                          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white/70 hover:bg-white/10"
                        >
                          Copy Caption
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => duplicateCreative({ id: item._id })}
                        className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100 hover:bg-orange-500/20"
                      >
                        Duplicate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this creative?")) {
                            removeCreative({ id: item._id });
                          }
                        }}
                        className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {campaignStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            updateStatus({
                              id: item._id,
                              campaignStatus: status,
                            })
                          }
                          className={`rounded-full border px-3 py-2 text-xs font-black capitalize ${
                            (item.campaignStatus || "draft") === status
                              ? "border-orange-300 bg-orange-500/15 text-orange-100"
                              : "border-white/10 bg-black/35 text-white/45 hover:bg-white/10"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="mb-4 flex items-center gap-2 text-xs text-white/35">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span>
                        {item.updatedAt
                          ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}`
                          : `Created ${new Date(item._creationTime).toLocaleDateString()}`}
                      </span>
                    </div>

                    {item.caption && (
                      <pre className="mt-4 max-h-36 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/50 p-4 text-xs leading-relaxed text-white/60">
                        {item.caption}
                      </pre>
                    )}

                    <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/30">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "Recently updated"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/events/${item.eventId}`}
                        className="rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-xs font-black text-violet-100 hover:bg-violet-500/20"
                      >
                        Open Event
                      </Link>

                      {item.sourceEventId && (
                        <p className="mb-3 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-100">
                          Linked Event Creative
                        </p>
                      )}

                      <div className="mb-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => duplicateCreative({ id: item._id })}
                          className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100 hover:bg-orange-500/20"
                        >
                          Duplicate
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this creative?")) {
                              removeCreative({ id: item._id });
                            }
                          }}
                          className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {campaignStatuses.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              updateStatus({
                                id: item._id,
                                campaignStatus: status,
                              })
                            }
                            className={`rounded-full border px-3 py-2 text-xs font-black capitalize ${
                              (item.campaignStatus || "draft") === status
                                ? "border-orange-300 bg-orange-500/15 text-orange-100"
                                : "border-white/10 bg-black/35 text-white/45 hover:bg-white/10"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="mb-4 flex items-center gap-2 text-xs text-white/35">
                        <div className="h-2 w-2 rounded-full bg-orange-400" />
                        <span>
                          {item.updatedAt
                            ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}`
                            : `Created ${new Date(item._creationTime).toLocaleDateString()}`}
                        </span>
                      </div>

                      {item.caption && (
                        <button
                          type="button"
                          onClick={() => copyCaption(item.caption)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white hover:bg-white/[0.08]"
                        >
                          Copy Caption
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this creative asset?")) {
                            deleteCreative({ id: item._id });
                          }
                        }}
                        className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-black text-red-100 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CreativeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
