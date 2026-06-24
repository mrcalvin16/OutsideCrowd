import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("Missing NEXT_PUBLIC_CONVEX_URL");
      return NextResponse.json(
        { error: "Missing Convex URL" },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.checkoutType === "ticket") {
      const eventId = session.metadata.eventId;
      const buyerEmail = session.metadata.buyerEmail;
      const buyerName = session.metadata.buyerName || "";
      const tickets = JSON.parse(session.metadata.tickets || "[]");

      if (!eventId || !buyerEmail || !tickets.length) {
        return NextResponse.json(
          { error: "Missing ticket metadata" },
          { status: 400 }
        );
      }

      await convex.mutation(api.tickets.createTicketsAfterPayment, {
        webhookSecret: process.env.STRIPE_WEBHOOK_SHARED_SECRET!,
        eventId: eventId as any,
        buyerEmail,
        buyerName,
        stripeCheckoutSessionId: session.id,
        tickets: tickets.map((line: any) => ({
          ticketTypeId: line.ticketTypeId as any,
          quantity: Number(line.quantity || 1),
        })),
      });

      return NextResponse.json({ received: true });
    }

    const eventId = session.metadata?.eventId;
    const tier = session.metadata?.tier;
    const durationDays = Number(session.metadata?.durationDays || 0);
    const featuredWeight = Number(session.metadata?.featuredWeight || 0);

    if (!eventId || !tier || !durationDays || !featuredWeight) {
      return NextResponse.json(
        { error: "Missing boost metadata" },
        { status: 400 }
      );
    }

    await convex.mutation(api.events.activateBoostAfterPayment, {
      webhookSecret: process.env.STRIPE_WEBHOOK_SHARED_SECRET!,
      eventId: eventId as any,
      tier,
      durationDays,
      featuredWeight,
      stripeCheckoutSessionId: session.id,
    });
  }

  return NextResponse.json({ received: true });
}
