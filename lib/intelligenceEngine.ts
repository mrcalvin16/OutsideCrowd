import { getRecommendationScore } from "./recommendationScore";
import { getMapDensityScore } from "./mapDensityScore";

export function buildIntelligence(events: any[], user: any) {
  const scoredEvents = events.map((event) => ({
    ...event,
    score: getRecommendationScore(event, user),
  }));

  const sortedEvents = [...scoredEvents].sort((a, b) => b.score - a.score);

  const mapZones = getMapDensityScore(events);

  return {
    rankedEvents: sortedEvents,
    mapZones,
  };
}
