"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const {isLoaded, isSignedIn, getToken} = useAuth();

  const generateUploadUrl = useMutation(api.events.generateUploadUrl);
  const createEvent = useMutation(api.events.createEvent);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Party");

  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [price, setPrice] = useState("");
  const [totalTickets, setTotalTickets] = useState("");

  const [dressCode, setDressCode] = useState("");
  const [ageRequirement, setAgeRequirement] = useState("21+");
  const [parkingInfo, setParkingInfo] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");

  const [image, setImage] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function geocodeAddress(fullLocation: string) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token || !fullLocation.trim()) {
      return { latitude: undefined, longitude: undefined };
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          fullLocation
        )}.json?access_token=${token}&limit=1`
      );

      if (!res.ok) {
        return { latitude: undefined, longitude: undefined };
      }

      const data = await res.json();
      const first = data?.features?.[0];

      if (!first?.center) {
        return { latitude: undefined, longitude: undefined };
      }

      const [longitude, latitude] = first.center;

      return { latitude, longitude };
    } catch {
      return { latitude: undefined, longitude: undefined };
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isLoaded) {
      setError("Auth is still loading. Try again in a second.");
      return;
    }

    if (!isSignedIn) {
      setError("Please sign in before creating an event.");
      return;
    }

    const convexToken = await getToken({ template: "convex" });

    if (!convexToken) {
      setError("Your secure session is still loading. Please refresh and try again.");
      return;
    }

    if (
      !name ||
      !description ||
      !venueName ||
      !venueAddress ||
      !city ||
      !stateValue ||
      !eventDate ||
      !price ||
      !totalTickets
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageStorageId: Id<"_storage"> | undefined = undefined;

      if (image) {
        const uploadUrl = await generateUploadUrl();

        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": image.type,
          },
          body: image,
        });

        if (!uploadResult.ok) {
          throw new Error("Image upload failed.");
        }

        const { storageId } = await uploadResult.json();
        imageStorageId = storageId;
      }

      const location = [venueName, venueAddress, city, stateValue]
        .filter(Boolean)
        .join(", ");

      const { latitude, longitude } = await geocodeAddress(location);

      const eventId = await createEvent({
        name,
        description,
        category,
        location,
        venueName,
        venueAddress,
        city,
        state: stateValue,
        latitude,
        longitude,
        eventDate: new Date(eventDate).getTime(),
        dateString: eventDate,
        price: Number(price),
        totalTickets: Number(totalTickets),

        dressCode,
        ageRequirement,
        parkingInfo,
        entryNotes,
        refundPolicy,

        imageStorageId,
      });

      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            OutsideCrowd Organizer
          </p>
          <h1 className="mt-3 text-4xl font-black">Create Event</h1>
          <p className="mt-2 text-white/60">
            Add your event details, venue, ticket price, and image.
          </p>
        </div>

        {!isLoaded ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            Loading account...
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            You must be signed in to create an event.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
          >
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
              placeholder="Event name"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
              placeholder="Tell people what your event is about..."
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
            >
              <option>Party</option>
              <option>Music</option>
              <option>Nightlife</option>
              <option>Festival</option>
              <option>Food</option>
              <option>Networking</option>
            </select>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <h2 className="mb-4 text-xl font-black">Venue Location</h2>

              <div className="space-y-4">
                <input
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
                  placeholder="Venue name"
                />

                <input
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
                  placeholder="Street address"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
                    placeholder="City"
                  />

                  <input
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
                placeholder="Ticket price"
              />

              <input
                type="number"
                min="1"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-white/40"
                placeholder="Total tickets"
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300/70">
                  Venue Rules
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Guest Experience
                </h2>
              </div>

              <div className="space-y-4">
                <input
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-violet-400/40"
                  placeholder="Dress code (All White, Upscale Casual, Festival Wear...)"
                />

                <select
                  value={ageRequirement}
                  onChange={(e) => setAgeRequirement(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-violet-400/40"
                >
                  <option>18+</option>
                  <option>21+</option>
                  <option>All Ages</option>
                </select>

                <textarea
                  value={parkingInfo}
                  onChange={(e) => setParkingInfo(e.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-violet-400/40"
                  placeholder="Parking instructions, valet, nearby lots..."
                />

                <textarea
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-violet-400/40"
                  placeholder="Entry notes, arrival times, security rules..."
                />

                <textarea
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-violet-400/40"
                  placeholder="Refund policy..."
                />
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-white px-5 py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
