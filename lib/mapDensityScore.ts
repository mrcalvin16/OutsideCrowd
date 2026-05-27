export function getMapDensityScore(events: any[]) {
  const zones: Record<string, number> = {};

  for (const e of events) {
    const key = `${e.city || "unknown"}-${e.state || "unknown"}`;

    let score = 0;

    score += (e.ticketsSold || 0);
    score += e.isPromoted ? 50 : 0;

    if (e.promotionTier === "city_takeover") score += 100;

    zones[key] = (zones[key] || 0) + score;
  }

  return zones;
}
