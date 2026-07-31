"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type EventRatingFormProps = {
  eventId: Id<"events">;
};

export default function EventRatingForm({
  eventId,
}: EventRatingFormProps) {
  const savedRating = useQuery(
    api.events.getMyEventRating,
    { eventId }
  );
  const submitRating = useMutation(
    api.events.submitEventRating
  );
  const [hoveredRating, setHoveredRating] =
    useState(0);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");

  const selectedRating = savedRating?.rating ?? 0;
  const visibleRating =
    hoveredRating || selectedRating;

  async function handleRating(rating: number) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await submitRating({
        eventId,
        rating,
      });
      setMessage("Rating saved. Thank you!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your rating."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-5 border-t border-white/10 pt-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-white">
            Rate your experience
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Verified ratings are available after check-in.
          </p>
        </div>

        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Event rating"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {[1, 2, 3, 4, 5].map((rating) => {
            const isActive = rating <= visibleRating;

            return (
              <button
                key={rating}
                type="button"
                role="radio"
                aria-checked={selectedRating === rating}
                aria-label={`${rating} star${
                  rating === 1 ? "" : "s"
                }`}
                disabled={
                  isSubmitting || savedRating === undefined
                }
                onMouseEnter={() =>
                  setHoveredRating(rating)
                }
                onFocus={() => setHoveredRating(rating)}
                onBlur={() => setHoveredRating(0)}
                onClick={() => handleRating(rating)}
                className="rounded-lg p-1.5 transition hover:scale-110 disabled:cursor-wait disabled:opacity-50"
              >
                <Star
                  className={`h-6 w-6 transition ${
                    isActive
                      ? "fill-orange-400 text-orange-400"
                      : "text-zinc-700"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {message ? (
        <p
          className={`mt-3 text-xs font-semibold ${
            message.startsWith("Rating saved")
              ? "text-emerald-400"
              : "text-red-300"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : selectedRating > 0 ? (
        <p className="mt-3 text-xs font-semibold text-orange-300">
          Your {selectedRating}-star rating is live. Select another star to update it.
        </p>
      ) : null}
    </div>
  );
}
