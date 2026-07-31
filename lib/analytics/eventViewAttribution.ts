const analyticsSessionKey =
  "outsidecrowd:event-view-session";

function createSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(
      analyticsSessionKey
    );

    if (existing) {
      return existing;
    }

    const sessionId = createSessionId();

    window.sessionStorage.setItem(
      analyticsSessionKey,
      sessionId
    );

    return sessionId;
  } catch {
    return createSessionId();
  }
}

export function getEventViewAttribution(): {
  source?: string;
  referrer?: string;
  path: string;
  sessionId: string;
} {
  const params = new URLSearchParams(
    window.location.search
  );
  const source =
    params.get("utm_source") ??
    params.get("source") ??
    undefined;

  return {
    source,
    referrer: document.referrer || undefined,
    path: window.location.pathname,
    sessionId: getSessionId(),
  };
}
