export function getRecommendationScore(event: any, user: any) {
  let score = 0;

  // Base engagement
  score += (event.ticketsSold || 0) * 2;

  // Boost influence (reuse your existing system)
  if (event.isPromoted) {
    if (event.promotionTier === "spotlight") score += 20;
    if (event.promotionTier === "weekend_push") score += 50;
    if (event.promotionTier === "city_takeover") score += 100;
  }

  // Saved events influence (light personalization signal)
  if (user?.savedEvents?.includes(event._id)) {
    score += 40;
  }

  // Category affinity (if exists later)
  if (user?.preferredCategories?.includes(event.category)) {
    score += 25;
  }

  // Recency boost
  const created = event.createdAt || 0;
  const ageHours = (Date.now() - created) / (1000 * 60 * 60);
  score += Math.max(0, 36 - ageHours);

  return Math.round(score);
}
