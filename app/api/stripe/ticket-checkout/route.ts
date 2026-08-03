import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";
import { getStripeClient } from "@/lib/stripe/server";

type CheckoutTicketRequest = {
  ticketTypeId?: string;
  quantity?: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      eventId,
      tickets,
      successPath,
      cancelPath,
    } = body;

    if (!eventId || !Array.isArray(tickets) || tickets.length !== 1) {
      return NextResponse.json(
        { error: "Missing ticket checkout details." },
        { status: 400 }
      );
    }

    const user = await currentUser();
    const buyerEmail = user?.primaryEmailAddress?.emailAddress
      .trim()
      .toLowerCase();

    if (!user || !buyerEmail) {
      return NextResponse.json(
        { error: "Please sign in with a verified email before checkout." },
        { status: 401 }
      );
    }

    const requestedTicket = tickets[0] as CheckoutTicketRequest;
    const quantity = Number(requestedTicket.quantity);

    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Ticket quantity must be between 1 and 10." },
        { status: 400 }
      );
    }

    const typedEventId = eventId as Id<"events">;
    const convex = getConvexClient();
    const [event, ticketTypes] = await Promise.all([
      convex.query(api.events.getById, { eventId: typedEventId }),
      convex.query(api.ticketTypes.getByEvent, { eventId: typedEventId }),
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const ticketType = requestedTicket.ticketTypeId
      ? ticketTypes.find(
          (candidate) => candidate._id === requestedTicket.ticketTypeId
        )
      : undefined;

    if (ticketTypes.length > 0 && !ticketType) {
      return NextResponse.json(
        { error: "Please select a valid ticket option." },
        { status: 400 }
      );
    }

    if (
      ticketType &&
      (ticketType.isActive === false ||
        ticketType.isSoldOut === true ||
        ticketType.salesPaused === true)
    ) {
      return NextResponse.json(
        { error: "This ticket option is not currently available." },
        { status: 409 }
      );
    }

    if (
      ticketType?.quantity !== undefined &&
      (ticketType.sold ?? 0) + quantity > ticketType.quantity
    ) {
      return NextResponse.json(
        { error: "There are not enough tickets remaining." },
        { status: 409 }
      );
    }

    const buyerName =
      user.fullName?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    const authoritativePrice = ticketType?.price ?? event.price ?? 0;

    if (!Number.isFinite(authoritativePrice) || authoritativePrice <= 0) {
      return NextResponse.json(
        { error: "This ticket does not require paid checkout." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const authoritativeTickets = [
      {
        ticketTypeId: ticketType?._id,
        quantity,
      },
    ];
    const lineItems = [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(authoritativePrice * 100),
          product_data: {
            name: `${event.name} — ${ticketType?.name || "Standard Admission"}`,
            description: ticketType?.description || "Event ticket",
          },
        },
      },
    ];

    const successUrl = buildReturnUrl(
      appUrl,
      successPath,
      "/onboarding/attendee",
      "success"
    );
    const cancelUrl = buildReturnUrl(
      appUrl,
      cancelPath,
      `/events/${eventId}/checkout`,
      "cancelled"
    );

    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: buyerEmail,
      line_items: lineItems,
      metadata: {
        checkoutType: "ticket",
        eventId,
        buyerEmail,
        buyerName: buyerName || "",
        tickets: JSON.stringify(authoritativeTickets),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Ticket checkout error:", error);

    return NextResponse.json(
      { error: "Unable to create ticket checkout session." },
      { status: 500 }
    );
  }
}

function buildReturnUrl(
  appUrl: string,
  requestedPath: string | undefined,
  fallbackPath: string,
  checkoutStatus: "success" | "cancelled"
): string {
  const safePath =
    requestedPath?.startsWith("/") &&
    !requestedPath.startsWith("//")
      ? requestedPath
      : fallbackPath;
  const url = new URL(safePath, appUrl);

  url.searchParams.set("checkout", checkoutStatus);

  return url.toString();
}
