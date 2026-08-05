import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";
import { getPrintfulOrderStatus } from "@/lib/printful/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const serverSecret = process.env.STRIPE_WEBHOOK_SHARED_SECRET;
    if (!serverSecret) throw new Error("Server secret is missing.");
    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    const typedOrderId = orderId as Id<"merchOrders">;
    const convex = getConvexClient();
    const record = await convex.query(api.merch.getPrintfulSyncRecord, { serverSecret, orderId: typedOrderId, clerkId: user.id });
    if (!record) return NextResponse.json({ error: "Printful order not found." }, { status: 404 });
    const status = await getPrintfulOrderStatus(record.printfulOrderId);
    await convex.mutation(api.merch.recordPrintfulShipment, { serverSecret, orderId: typedOrderId, clerkId: user.id, printfulStatus: status.status, trackingNumber: status.trackingNumber, trackingUrl: status.trackingUrl, shipped: status.shipped });
    return NextResponse.json(status);
  } catch (error) {
    console.error("Printful order sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sync Printful status." }, { status: 500 });
  }
}
