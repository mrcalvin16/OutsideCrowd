export async function trackEvent(eventId: string, type: string) {
  try {
    await fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, type }),
    });
  } catch (e) {
    // fail silently (never block UI)
  }
}
