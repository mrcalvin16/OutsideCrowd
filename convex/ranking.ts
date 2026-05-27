export function calculateEventScore(event: any) {
  let score = 0;

  // Base engagement signals
  score += (event.ticketsSold || 0) * 2;

  // Boost system influence (existing system)
  if (event.isPromoted) {
    if (event.promotionTier === "spotlight") score += 25;
    if (event.promotionTier === "weekend_push") score += 60;
    if (event.promotionTier === "city_takeover") score += 120;
  }

  // Recency bias (newer events rank higher)
  const created = event.createdAt || 0;
  const ageHours = (Date.now() - created) / (1000 * 60 * 60);
  score += Math.max(0, 48 - ageHours); // decay over 48h

  // Capacity momentum (if present)
  if (event.totalTickets && event.ticketsSold) {
    const fillRate = event.ticketsSold / event.totalTickets;
    score += fillRate * 50;
  }

  // Featured weight override
  if (event.featuredWeight) {
    score += event.featuredWeight;
  }

  return Math.round(score);
}
