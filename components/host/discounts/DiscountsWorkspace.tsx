"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, Percent, Plus, Tag, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function DiscountsWorkspace({ fixedEventId }: { fixedEventId?: Id<"events"> }) {
  const events = useQuery(api.events.getMyEvents);
  const [eventId, setEventId] = useState<Id<"events"> | undefined>(fixedEventId);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [minimumQuantity, setMinimumQuantity] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!fixedEventId && !eventId && events?.[0]?._id) setEventId(events[0]._id);
  }, [eventId, events, fixedEventId]);

  const discounts = useQuery(api.discountCodes.listByEvent, eventId ? { eventId } : "skip");
  const createDiscount = useMutation(api.discountCodes.create);
  const toggleDiscount = useMutation(api.discountCodes.toggleActive);
  const removeDiscount = useMutation(api.discountCodes.remove);
  const selectedEvent = useMemo(() => events?.find((event) => event._id === eventId), [eventId, events]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventId || busy) return;
    setBusy(true); setMessage(""); setError("");
    try {
      await createDiscount({
        eventId,
        code,
        discountType: type,
        discountValue: Number(value),
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        minimumQuantity: minimumQuantity ? Number(minimumQuantity) : undefined,
        startsAt: startsAt ? new Date(startsAt).getTime() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
      });
      setCode(""); setValue(""); setMaxRedemptions(""); setMinimumQuantity(""); setStartsAt(""); setExpiresAt("");
      setMessage("Discount code created and ready for checkout.");
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : "Unable to create discount code.");
    } finally { setBusy(false); }
  }

  async function copyCode(valueToCopy: string) {
    await navigator.clipboard.writeText(valueToCopy);
    setMessage(`${valueToCopy} copied.`);
  }

  async function remove(id: Id<"discountCodes">) {
    if (!window.confirm("Delete this discount code permanently?")) return;
    await removeDiscount({ discountCodeId: id });
    setMessage("Discount code deleted.");
  }

  return (
    <div className="space-y-5">
      {!fixedEventId && (
        <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#0c0b14]/85 p-5 sm:p-6">
          <label htmlFor="discount-event" className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Discounts for</label>
          <select id="discount-event" value={eventId ?? ""} onChange={(event) => setEventId(event.target.value as Id<"events">)} className="mt-3 min-h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white">
            <option value="" disabled>Select an event</option>
            {(events ?? []).map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}
          </select>
        </section>
      )}

      {!eventId ? <EmptyDiscounts /> : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="rounded-[1.5rem] border border-white/[0.08] bg-[#0c0b14]/85 p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Promo Operations</p>
            <h2 className="mt-2 text-2xl font-black">{selectedEvent?.name ?? "Discount codes"}</h2>
            <p className="mt-1 text-sm text-zinc-500">Create, pause, copy, and monitor codes used at ticket checkout.</p>
            {message && <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300"><Check className="mr-2 inline h-4 w-4" />{message}</p>}
            {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}

            <div className="mt-5 space-y-3">
              {discounts === undefined ? <div className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" /> : discounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center text-sm text-zinc-600">No discount codes yet.</div>
              ) : discounts.map((discount) => {
                const expired = Boolean(discount.expiresAt && discount.expiresAt < Date.now());
                return (
                  <article key={discount._id} className="rounded-2xl border border-white/[0.08] bg-black/25 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300"><Tag className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-white">{discount.code}</p>
                          <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase ${expired ? "border-red-400/20 text-red-300" : discount.isActive ? "border-emerald-400/20 text-emerald-300" : "border-white/10 text-zinc-500"}`}>{expired ? "Expired" : discount.isActive ? "Active" : "Paused"}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">{discount.discountType === "percentage" ? `${discount.discountValue}% off` : `$${discount.discountValue.toFixed(2)} off`} · {discount.redemptionCount ?? 0}{discount.maxRedemptions ? ` / ${discount.maxRedemptions}` : ""} redeemed</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => copyCode(discount.code)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white" aria-label={`Copy ${discount.code}`}><Copy className="h-4 w-4" /></button>
                        <button type="button" disabled={expired} onClick={() => toggleDiscount({ discountCodeId: discount._id })} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-black text-zinc-300 disabled:opacity-40">{discount.isActive ? "Pause" : "Activate"}</button>
                        <button type="button" onClick={() => remove(discount._id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/15 text-red-300 hover:bg-red-400/10" aria-label={`Delete ${discount.code}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <form onSubmit={submit} className="h-fit rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-br from-[#171128] to-[#15100e] p-5 sm:p-6">
            <Plus className="h-6 w-6 text-violet-300" /><h2 className="mt-3 text-xl font-black">Create discount</h2>
            <div className="mt-5 space-y-3">
              <input required minLength={3} value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="SUMMER25" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 font-black uppercase outline-none focus:border-violet-400/50" />
              <div className="grid grid-cols-2 gap-3">
                <select value={type} onChange={(event) => setType(event.target.value as "percentage" | "fixed")} className="min-h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold"><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select>
                <label className="flex min-h-11 items-center rounded-xl border border-white/10 bg-black/30 px-3"><span className="text-zinc-600">{type === "percentage" ? <Percent className="h-4 w-4" /> : "$"}</span><input required type="number" min="0.01" max={type === "percentage" ? 100 : undefined} step="0.01" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Value" className="w-full bg-transparent px-2 text-sm outline-none" /></label>
              </div>
              <div className="grid grid-cols-2 gap-3"><input type="number" min="1" value={maxRedemptions} onChange={(event) => setMaxRedemptions(event.target.value)} placeholder="Max uses" className="min-h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none" /><input type="number" min="1" value={minimumQuantity} onChange={(event) => setMinimumQuantity(event.target.value)} placeholder="Min tickets" className="min-h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none" /></div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Starts<input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-300" /></label>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Expires<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-300" /></label>
              <button disabled={busy} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-5 text-sm font-black disabled:opacity-50">{busy ? "Creating…" : "Create code"}</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

function EmptyDiscounts() {
  return <div className="rounded-[1.5rem] border border-dashed border-white/10 px-6 py-16 text-center"><Tag className="mx-auto h-8 w-8 text-zinc-700" /><h2 className="mt-4 text-xl font-black">Create an event first</h2><p className="mt-2 text-sm text-zinc-600">Discount codes belong to a specific event.</p></div>;
}
