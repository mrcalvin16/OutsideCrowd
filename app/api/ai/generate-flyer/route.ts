import { NextResponse } from "next/server";

type FlyerRequestBody = {
  prompt?: string;
  city?: string;
  audience?: string;
  eventType?: string;
  category?: string;
  composition?: string;
  style?: string;
  quality?: "fast" | "premium";
  format?: "poster" | "square" | "story";
  eventDate?: string;
  venue?: string;
  sourceEventImage?: string;
  cta?: string;
  eventTitle?: string;
  lightingMood?: string;
  energyLevel?: string;
  visualStyle?: string;
};

function buildCreativePrompt(body: FlyerRequestBody) {
  const rawPrompt = body.prompt || "premium nightlife event";
  const city = body.city || "New Orleans";
  const audience = body.audience || "stylish event-goers";
  const eventType = body.eventType || body.category || "nightlife";
  const composition = body.composition || "hero";
  const style = body.style || "Luxury";
  const eventDate = body.eventDate || "";
  const venue = body.venue || "";
  const sourceEventImage = body.sourceEventImage || "";
  const cta = body.cta || "Get Tickets";

  const eventTypeMap: Record<string, string> = {
    nightlife:
      "nightclub energy, velvet rope exclusivity, late-night atmosphere, stylish crowd",
    festival:
      "large outdoor crowd, stage lighting, cultural celebration, energetic social gathering",
    conference:
      "premium business event, keynote stage, professional networking, executive atmosphere",
    brunch:
      "daytime social event, stylish dining, champagne, warm elegant lifestyle visuals",
    concert:
      "live performance energy, stage lights, artist-centered composition, fan excitement",
    wellness:
      "calm luxury wellness retreat, soft lighting, clean premium spa aesthetic",
    sports:
      "high-energy competition, crowd excitement, bold athletic atmosphere",
  };

  const compositionMap: Record<string, string> = {
    hero: "large central hero composition with dominant focal point and cinematic symmetry",
    editorial:
      "editorial magazine-inspired flyer composition with luxury spacing and typography hierarchy",
    collage:
      "layered collage aesthetic with dynamic overlapping visuals and nightlife energy",
    minimalist:
      "minimal luxury composition with clean typography and strong negative space",
    cinematic:
      "movie-poster-inspired cinematic composition with dramatic lighting and depth",
    chaotic:
      "high-energy nightlife flyer with layered visuals and explosive crowd atmosphere",
  };

  const styleMap: Record<string, string> = {
    Luxury:
      "ultra-premium luxury nightlife flyer, black editorial background, gold-orange glow, velvet shadows, high-fashion event branding",
    Underground:
      "underground warehouse rave flyer, gritty dark atmosphere, neon violet lighting, industrial textures, cinematic haze",
    Festival:
      "large-scale festival poster, vibrant crowd energy, stage lights, confetti, immersive music culture",
    Rooftop:
      "luxury rooftop party flyer, skyline view, sunset glow, champagne atmosphere",
    EDM: "EDM concert flyer, laser lights, futuristic neon visuals, high-energy club atmosphere",
    Afrobeats:
      "Afrobeats party flyer, warm luxury colors, rhythmic movement, elegant nightlife crowd",
    College:
      "college event flyer, youthful high-energy social scene, bold typography, campus nightlife",
    AfroFuture:
      "Afrofuturistic luxury event flyer, deep violet glow, gold-orange highlights, futuristic fashion",
    MiamiNeon:
      "Miami neon nightlife flyer, tropical luxury, electric pink violet orange lights, palm silhouettes",
    Y2K: "Y2K party flyer, chrome design, glossy futuristic textures, violet glow",
    BoilerRoom:
      "underground music flyer, raw crowd energy, dark warehouse setting, red-orange lighting",
    Gala: "black tie gala flyer, elegant luxury editorial style, champagne glow, velvet black background",
  };

  const creativePrompt = `
Create a premium vertical event flyer poster.

Event title:
${body.eventTitle || "OutsideCrowd Event"}

Event concept:
${rawPrompt}

Event details:
Date: ${eventDate || "date not provided"}
Venue: ${venue || "venue not provided"}
City: ${city}
Audience: ${audience}
Source image: ${
    sourceEventImage
      ? "Use the supplied event image as visual inspiration"
      : "No source image provided"
  }

Event direction:
${eventTypeMap[eventType.toLowerCase()] || eventTypeMap.nightlife}

Composition:
${compositionMap[composition.toLowerCase()] || compositionMap.hero}

Visual style:
${styleMap[style] || styleMap.Luxury}

Lighting:
${body.lightingMood || "cinematic violet and orange lighting"}

Energy:
${body.energyLevel || "premium high-energy atmosphere"}

Editorial direction:
${body.visualStyle || "luxury editorial campaign"}

Brand identity:
OutsideCrowd premium event-discovery aesthetic.
Deep black background.
Orange and violet cinematic glow.
Elevated cultural energy.
Fashion-editorial composition.
Premium event branding.
Rich contrast.
Atmospheric lighting.
Clean headline space.

Call to action:
Leave clean visual space for: ${cta}

Avoid:
Generic AI poster layouts.
Clutter.
Cheap gradients.
Bad anatomy.
Distorted faces or hands.
Unreadable or misspelled text.
Fake logos.
Random watermarks.
Oversaturation.
Low-resolution output.

Output:
Vertical event poster.
Premium campaign visual.
Highly detailed.
No watermark.
`;

  return encodeURIComponent(creativePrompt.trim());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FlyerRequestBody;

    if (!body.prompt?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A flyer prompt is required.",
        },
        { status: 400 },
      );
    }

    const style = body.style || "Luxury";
    const premium = body.quality !== "fast";
    const format = body.format || "poster";
    const city = body.city || "New Orleans";
    const eventType = body.eventType || body.category || "nightlife";
    const eventDate = body.eventDate || "";
    const venue = body.venue || "";
    const cta = body.cta || "Get Tickets";

    const prompt = buildCreativePrompt(body);

    const seeds = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 999999),
    );

    const dimensions =
      format === "square"
        ? {
            width: premium ? 1024 : 768,
            height: premium ? 1024 : 768,
          }
        : format === "story"
          ? {
              width: premium ? 1080 : 720,
              height: premium ? 1920 : 1280,
            }
          : {
              width: premium ? 1024 : 768,
              height: premium ? 1536 : 1152,
            };

    const variations = seeds.map((seed, index) => {
      const imageUrl =
        `https://image.pollinations.ai/prompt/${prompt}` +
        `?width=${dimensions.width}` +
        `&height=${dimensions.height}` +
        `&nologo=true` +
        `&enhance=${premium ? "true" : "false"}` +
        `&seed=${seed}` +
        `&model=flux`;

      return {
        id: `variation-${index + 1}`,
        imageUrl,
        caption: `${style} flyer variation ${index + 1}`,
      };
    });

    const socialCaption =
      `The crowd is calling. ${body.prompt} is now live on OutsideCrowd.` +
      `${eventDate ? ` ${eventDate}.` : ""}` +
      `${venue ? ` ${venue}.` : ""}` +
      ` ${cta}.`;

    const captionVariants = [
      socialCaption,
      `Your next experience starts here. ${body.prompt} is live on OutsideCrowd—lock in your spot.`,
      `New signal detected. ${body.prompt} just hit OutsideCrowd. RSVP energy only.`,
    ];

    const cityTag = `#${city.replace(/[^a-zA-Z0-9]/g, "")}`;

    const typeTags: Record<string, string[]> = {
      nightlife: ["#Nightlife", "#Party", "#AfterDark"],
      festival: ["#Festival", "#LiveMusic", "#CrowdEnergy"],
      concert: ["#Concert", "#LiveMusic", "#OnStage"],
      conference: ["#Conference", "#Networking", "#BusinessEvents"],
      brunch: ["#Brunch", "#DayParty", "#SocialScene"],
      wellness: ["#Wellness", "#SelfCare", "#Lifestyle"],
      sports: ["#Sports", "#GameDay", "#FanEnergy"],
    };

    const hashtags = [
      "#OutsideCrowd",
      cityTag,
      ...(typeTags[eventType.toLowerCase()] || typeTags.nightlife),
      "#ThingsToDo",
      "#LiveEvents",
      "#CrowdCulture",
    ];

    return NextResponse.json({
      success: true,
      imageUrl: variations[0].imageUrl,
      variations,
      caption: socialCaption,
      captionVariants,
      hashtags,
      provider: "pollinations",
    });
  } catch (error) {
    console.error("Flyer generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Flyer generation failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    provider: "pollinations",
  });
}
