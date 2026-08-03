"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FlyerDocument } from "../types";

export function useFlyerDraft(eventId: string) {
  const creatives = useQuery(
    api.eventCreative.listByEvent,
    eventId ? { eventId: eventId as Id<"events"> } : "skip"
  );
  const saveCreative = useMutation(api.eventCreative.saveCreative);
  const updateCreative = useMutation(api.eventCreative.updateCreative);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const savedDraft = useMemo(
    () => creatives?.find((creative) => creative.editorState),
    [creatives]
  );

  async function saveDraft({
    document,
    title,
    prompt,
    style,
    imageUrl,
  }: {
    document: FlyerDocument;
    title: string;
    prompt: string;
    style: string;
    imageUrl: string;
  }) {
    if (!eventId || isSaving) return;

    try {
      setIsSaving(true);
      setSaveStatus("Saving…");
      const editorState = JSON.stringify(document);

      if (savedDraft) {
        await updateCreative({
          id: savedDraft._id,
          title,
          prompt,
          style,
          imageUrl,
          editorState,
        });
      } else {
        await saveCreative({
          eventId: eventId as Id<"events">,
          title,
          prompt,
          style,
          imageUrl,
          editorState,
          campaignStatus: "draft",
        });
      }

      setSaveStatus("Saved");
    } catch (error) {
      setSaveStatus(
        error instanceof Error ? error.message : "Draft could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    savedDraft,
    isLoading: Boolean(eventId) && creatives === undefined,
    isSaving,
    saveStatus,
    saveDraft,
  };
}
