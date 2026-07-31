export type TrafficSourceKey =
  | "direct"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "search"
  | "email"
  | "referral";

const sourceMatchers: Array<{
  key: Exclude<TrafficSourceKey, "direct" | "referral">;
  patterns: string[];
}> = [
  {
    key: "instagram",
    patterns: ["instagram", "ig"],
  },
  {
    key: "tiktok",
    patterns: ["tiktok"],
  },
  {
    key: "facebook",
    patterns: ["facebook", "fb", "meta"],
  },
  {
    key: "search",
    patterns: [
      "google",
      "bing",
      "yahoo",
      "duckduckgo",
      "search",
    ],
  },
  {
    key: "email",
    patterns: [
      "email",
      "newsletter",
      "mailchimp",
      "constantcontact",
    ],
  },
];

function matchKnownSource(
  value: string
): TrafficSourceKey | null {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (
    normalized === "direct" ||
    normalized === "none"
  ) {
    return "direct";
  }

  for (const matcher of sourceMatchers) {
    if (
      matcher.patterns.some((pattern) =>
        normalized.includes(pattern)
      )
    ) {
      return matcher.key;
    }
  }

  return null;
}

export function classifyTrafficSource(
  source?: string,
  referrer?: string
): TrafficSourceKey {
  const explicitSource = source
    ? matchKnownSource(source)
    : null;

  if (explicitSource) {
    return explicitSource;
  }

  if (source?.trim()) {
    return "referral";
  }

  if (!referrer?.trim()) {
    return "direct";
  }

  try {
    const hostname = new URL(referrer).hostname
      .replace(/^www\./, "")
      .toLowerCase();

    if (
      hostname === "outsidecrowd.com" ||
      hostname.endsWith(".outsidecrowd.com")
    ) {
      return "direct";
    }

    return matchKnownSource(hostname) ?? "referral";
  } catch {
    return matchKnownSource(referrer) ?? "referral";
  }
}

export const trafficSourceLabels: Record<
  TrafficSourceKey,
  string
> = {
  direct: "Direct",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  search: "Search",
  email: "Email",
  referral: "Referral",
};
