"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function EditMerchPage({
  params,
}: {
  params: Promise<{ id: string; merchId: string }>;
}) {
  const { id, merchId } = use(params);
  const eventId = id as Id<"events">;
  const merchItemId = merchId as Id<"merch">;
  const router = useRouter();

  const event = useQuery(api.events.getById, { eventId });
  const merch = useQuery(api.merch.getById, { merchId: merchItemId });

  const updateMerch = useMutation(api.merch.updateMerch);
  const deleteMerch = useMutation(api.merch.deleteMerch);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [sizes, setSizes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPreorder, setIsPreorder] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!merch) return;

    setName(merch.name ?? "");
    setDescription(merch.description ?? "");
    setPrice(String(merch.price ?? 0));
    setInventory(String(merch.inventory ?? 0));
    setSizes((merch.sizes ?? []).join(", "));
    setIsActive(merch.isActive ?? true);
    setIsPreorder(merch.isPreorder ?? false);
  }, [merch]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Merch name is required.");
      return;
    }

    if (Number(price) < 0 || Number.isNaN(Number(price))) {
      setError("Price must be 0 or greater.");
      return;
    }

    if (Number(inventory) < 0 || Number.isNaN(Number(inventory))) {
      setError("Inventory must be 0 or greater.");
      return;
    }

    try {
      setSaving(true);

      await updateMerch({
        merchId: merchItemId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        inventory: Number(inventory),
        sizes: sizes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isActive,
        isPreorder,
      });

      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to update merch.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this merch item? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteMerch({ merchId: merchItemId });
      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to delete merch.");
    } finally {
      setDeleting(false);
    }
  }

  if (event === undefined || merch === undefined) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        Loading merch...
      </main>
    );
  }

  if (!event || !merch) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        Merch item not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-white/50 hover:text-white"
        >
          ← Back to event
        </Link>

        <div className="mt-6 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            Host Merch Controls
          </p>
          <h1 className="mt-3 text-4xl font-black">Edit Merch</h1>
          <p className="mt-2 text-white/60">
            Update pricing, inventory, sizes, and availability.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
        >
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-white/70">
              Merch Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white/70">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/70">
                Inventory
              </label>
              <input
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70">
              Sizes
            </label>
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="S, M, L, XL"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm text-white/70">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm text-white/70">
              <input
                type="checkbox"
                checked={isPreorder}
                onChange={(e) => setIsPreorder(e.target.checked)}
              />
              Preorder
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-white px-5 py-4 font-black text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-2xl border border-red-500/30 px-5 py-4 font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
