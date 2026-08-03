import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";

export async function GET(req: NextRequest) {
  const storageId = req.nextUrl.searchParams.get("storageId");

  if (!storageId) {
    return new NextResponse("", { status: 400 });
  }

  const url = await getConvexClient().query(api.events.getImageUrl, {
    storageId: storageId as Id<"_storage">,
  });

  return new NextResponse(url || "", {
    status: 200,
  });
}
