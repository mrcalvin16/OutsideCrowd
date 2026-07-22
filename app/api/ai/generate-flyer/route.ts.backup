import { NextResponse } from "next/server";

function buildCreativePrompt(body: any) {
  const rawPrompt = body?.prompt || "premium nightlife event";
  const city = body?.city || "New Orleans";
  const audience = body?.audience || "stylish event-goers";
  const eventType = body?.eventType || body?.category || "nightlife";
  const composition = body?.composition || "hero";
  const style = body?.style || "Luxury";
  const premium = body?.quality !== "fast";

  const eventTypeMap: Record<string, string> = {
    nightlife: "nightclub energy, velvet rope exclusivity, late-night atmosphere, stylish crowd",
    festival: "large outdoor crowd, stage lighting, cultural celebration, energetic social gathering",
    conference: "premium business event, keynote stage, professional networking, executive atmosphere",
    brunch: "daytime social event, stylish dining, champagne, warm elegant lifestyle visuals",
    concert: "live performance energy, stage lights, artist-centered composition, fan excitement",
    wellness: "calm luxury wellness retreat, soft lighting, clean premium spa aesthetic",
    sports: "high-energy competition, crowd excitement, bold athletic atmosphere",
  };

  
  const compositionMap: Record<string, string> = {
    hero: "large central hero composition with dominant focal point and cinematic symmetry",
    editorial: "editorial magazine-inspired flyer composition with luxury spacing and typography hierarchy",
    collage: "layered collage aesthetic with dynamic overlapping visuals and nightlife energy",
    minimalist: "minimal luxury composition with clean typography and strong negative space",
    cinematic: "movie-poster-inspired cinematic composition with dramatic lighting and depth",
    chaotic: "high-energy chaotic nightlife flyer with layered visuals and explosive crowd atmosphere",
  };


  const styleMap: Record<string, string> = {
    Luxury:
      "ultra-premium luxury nightlife flyer, black editorial background, gold-orange glow, velvet shadows, high-fashion event branding",
    Underground:
      "underground warehouse rave flyer, gritty dark atmosphere, neon violet lighting, industrial textures, cinematic haze",
    Festival:
      "large-scale festival poster, vibrant crowd energy, stage lights, confetti, immersive music culture, dramatic composition",
    Rooftop:
      "luxury rooftop party flyer, skyline view, sunset glow, champagne atmosphere, elevated social scene",
    EDM:
      "EDM concert flyer, laser lights, futuristic neon visuals, high-energy club atmosphere, bass-heavy visual identity",
    Afrobeats:
      "Afrobeats party flyer, warm luxury colors, rhythmic movement, elegant nightlife crowd, modern African-inspired energy",
    College:
      "college event flyer, youthful high-energy social scene, bold typography, campus nightlife, modern party branding",
    AfroFuture:
      "Afrofuturistic luxury event flyer, deep violet glow, gold-orange highlights, futuristic fashion, premium cultural nightlife energy",
    MiamiNeon:
      "Miami neon nightlife flyer, tropical luxury, electric pink violet orange lights, palm silhouettes, glossy club atmosphere",
    Y2K:
      "Y2K party flyer, chrome typography inspiration, glossy futuristic textures, violet glow, early-2000s cyber nightlife energy",
    BoilerRoom:
      "Boiler Room inspired underground music flyer, raw crowd energy, dark warehouse setting, red-orange lighting, intimate DJ culture",
    Gala:
      "black tie gala flyer, elegant luxury editorial style, champagne glow, velvet black background, premium formal event branding",
  };

  return encodeURIComponent(`
    Create a premium event flyer poster.

    Event concept:
    ${rawPrompt}

    Event details:
    Date: ${eventDate || "date not provided"}.
    Venue: ${venue || "venue not provided"}.
    Source event image reference: ${sourceEventImage ? "event image available for context" : "no source image provided"}.

    Creative interpretation:
    Transform this simple event idea into a premium campaign visual.
    Make it feel like a real paid event launch, not a generic poster.
    Assume the audience is ${audience}.
    Suggested city atmosphere: ${city}.
    Event type intelligence:
    ${eventTypeMap[String(eventType).toLowerCase()] || eventTypeMap.nightlife}

    Composition direction:
    ${compositionMap[String(composition).toLowerCase()] || compositionMap.hero}

    Visual direction:
    ${styleMap[style] || styleMap.Luxury}

    Brand identity system:
    OutsideCrowd premium nightlife operating system aesthetic.

    Core visual language:
    Deep black background.
    Orange and violet cinematic glow.
    Futuristic nightlife luxury.
    Elevated cultural energy.
    Fashion-editorial composition.
    Premium event branding.
    Moody atmosphere.
    Rich contrast.
    Atmospheric lighting.
    Luxury typography spacing.
    Social-first campaign design.

    The flyer should feel:
    expensive,
    cinematic,
    viral,
    modern,
    exclusive,
    immersive,
    premium.

    Negative prompt:
    Avoid generic AI poster layouts.
    Avoid clutter.
    Avoid cheap gradients.
    Avoid bad anatomy.
    Avoid distorted faces.
    Avoid messy hands.
    Avoid unreadable typography.
    Avoid misspelled words.
    Avoid fake logos.
    Avoid random watermarks.
    Avoid oversaturated colors.
    Avoid low-resolution output.
    Avoid chaotic composition.
    Avoid messy text placement.

    CTA direction:
    Include visual space for this call-to-action: ${cta}.
    Make the flyer feel conversion-focused without clutter.

    Typography:
    Clean bold headline space.
    Minimal readable layout.
    Avoid misspelled text.
    Avoid distorted letters.
    Avoid cluttered typography.

    Output:
    Vertical poster.
    Premium launch flyer.
    Highly detailed.
    No watermark.
  `);
}

export async function POST(req: Request) {
  const body = await req.json();
  const style = body?.style || "Luxury";
  const premium = body?.quality !== "fast";
  const prompt = buildCreativePrompt(body);

  const seeds = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 999999)
  );

  const dimensions =
    format === "square"
      ? { width: premium ? 1024 : 768, height: premium ? 1024 : 768 }
      : format === "story"
        ? { width: premium ? 1080 : 720, height: premium ? 1920 : 1280 }
        : { width: premium ? 1024 : 768, height: premium ? 1536 : 1152 };

  const variations = seeds.map((seed, index) => ({
    id: `variation-${index + 1}`,
    imageUrl: `https://image.pollinations.ai/prompt/${prompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=${premium ? "true" : "false"}&seed=${seed}`,
    caption: `${style} flyer variation ${index + 1}`,
  }));

  const socialCaption = `The crowd is calling. ${body?.prompt || "New event"} is now live on OutsideCrowd.${eventDate ? ` ${eventDate}.` : ""}${venue ? ` ${venue}.` : ""} ${cta}.`;

  const captionVariants = [
    socialCaption,
    `Your next night out starts here. ${body?.prompt || "This event"} is live on OutsideCrowd — don’t wait to lock in your spot.`,
    `New signal detected. ${body?.prompt || "A new event"} just hit OutsideCrowd. RSVP energy only.`,
  ];

  const cityTag = `#${String(city).replace(/[^a-zA-Z0-9]/g, "")}`;

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
    ...(typeTags[String(eventType).toLowerCase()] || typeTags.nightlife),
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
}

export async function GET() {
  return NextResponse.json({ success: true, provider: "pollinations" });
}
