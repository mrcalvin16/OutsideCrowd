import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function GET(req: NextRequest) {
  const storageId = req.nextUrl.searchParams.get("storageId");

  if (!storageId) {
    return new NextResponse("", { status: 400 });
  }

  const url = await convex.query(api.events.getImageUrl, {
    storageId: storageId as any,
  });

  return new NextResponse(url || "", {
    status: 200,
  });
}
