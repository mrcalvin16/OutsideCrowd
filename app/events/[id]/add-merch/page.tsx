"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AddMerchPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const eventId = params.id as Id<"events">;

  const event = useQuery(api.events.getById, { eventId });

  const createMerchItem = useMutation(api.merch.create);
  const generateUploadUrl = useMutation(api.merch.generateUploadUrl);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [sizes, setSizes] = useState("");
  const [isPreorder, setIsPreorder] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [limitedDrop, setLimitedDrop] = useState(false);
  const [pickupAtEvent, setPickupAtEvent] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoaded || event === undefined) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-white/60">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold">Sign in required</h1>
          <p className="mt-3 text-white/60">
            You must be signed in to add merch.
          </p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold">Event not found</h1>
        </div>
      </main>
    );
  }

  const isOrganizer =
    event.userId === user.id || event.organizerId === user.id;

  if (!isOrganizer) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold">Not authorized</h1>
          <p className="mt-3 text-white/60">
            Only the event organizer can add merch.
          </p>
          <Link
            href={`/events/${eventId}`}
            className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-bold text-black"
          >
            Back to Event
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !inventory) {
      alert("Please add a merch name, price, and inventory.");
      return;
    }

    try {
      setLoading(true);

      let imageStorageId: Id<"_storage"> | undefined = undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": imageFile.type,
          },
          body: imageFile,
        });

        if (!result.ok) {
          throw new Error("Image upload failed.");
        }

        const json = await result.json();
        imageStorageId = json.storageId as Id<"_storage">;
      }

      await createMerchItem({
        eventId,
        name,
        description: description || undefined,
        price: Number(price),
        inventory: Number(inventory),
        imageStorageId,
        sizes: sizes
          ? sizes
              .split(",")
              .map((size) => size.trim())
              .filter(Boolean)
          : undefined,
        isPreorder,
        featured,
        limitedDrop,
        pickupAtEvent,
      });

      router.push(`/events/${eventId}`);
    } catch (error: any) {
      alert(error.message || "Failed to create merch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-white/60 hover:text-white"
        >
          ← Back to Event
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">Add Merch</h1>

          <p className="mt-2 text-white/60">
            Create merch for{" "}
            <span className="font-semibold text-white">{event.name}</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-white/70">
                Merch Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Event Tee, VIP Hoodie, Poster..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/70">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Limited edition event merch..."
                rows={4}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/70">
                Merch Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black"
              />
              {imageFile && (
                <p className="mt-2 text-xs text-white/50">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-white/70">
                  Price
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25.00"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/70">
                  Inventory
                </label>
                <input
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="100"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
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
                placeholder="S, M, L, XL, 2XL"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
              />
              <p className="mt-2 text-xs text-white/40">
                Separate sizes with commas.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
                <input
                  type="checkbox"
                  checked={isPreorder}
                  onChange={(e) => setIsPreorder(e.target.checked)}
                />
                <span className="text-sm text-white/70">
                  This is a preorder item
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span className="text-sm text-white/70">
                  Feature this merch
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
                <input
                  type="checkbox"
                  checked={limitedDrop}
                  onChange={(e) => setLimitedDrop(e.target.checked)}
                />
                <span className="text-sm text-white/70">
                  Mark as limited drop
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
                <input
                  type="checkbox"
                  checked={pickupAtEvent}
                  onChange={(e) => setPickupAtEvent(e.target.checked)}
                />
                <span className="text-sm text-white/70">
                  Pickup at event available
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-5 py-4 font-bold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding Merch..." : "Add Merch"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}