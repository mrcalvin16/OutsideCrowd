"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useUser();

  const createEvent = useMutation(api.events.create);
  const generateUploadUrl = useMutation(api.events.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) return undefined;

    const uploadUrl = await generateUploadUrl();

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": imageFile.type,
      },
      body: imageFile,
    });

    const { storageId } = await result.json();

    return storageId as Id<"_storage">;
  }

  async function handleCreateEvent() {
    if (!user) return;

    if (!title.trim()) {
      alert("Event title is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageStorageId = await uploadImage();

      const eventId = await createEvent({
        name: title,
        description,
        location,
        dateString: date,
        eventDate: date ? new Date(date).getTime() : undefined,
        price: price ? Number(price) : undefined,
        totalTickets: totalTickets ? Number(totalTickets) : undefined,
        imageStorageId: imageStorageId,
        userId: user.id,
      });

      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Something went wrong creating the event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Create Event</h1>
            <p className="mt-2 text-white/60">
              Add the basics for your event.
            </p>
          </div>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <SignedOut>
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
            <h2 className="text-2xl font-semibold">Login to create events</h2>
            <p className="mt-3 text-white/60">
              You need an organizer account before creating an event.
            </p>

            <SignInButton mode="modal">
              <button className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-black">
                Login
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <form className="space-y-5 rounded-3xl border border-white/10 bg-zinc-950 p-8">
            <div>
              <label className="text-sm text-white/60">Event Image</label>

              <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-white/40">
                    Upload an event image
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Event Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer Kickback"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New Orleans, LA"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Ticket Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Total Tickets</label>
              <input
                type="number"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                placeholder="100"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what to expect..."
                className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateEvent}
              disabled={isSubmitting}
              className="w-full rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </form>
        </SignedIn>
      </section>
    </main>
  );
}