import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      eventId,
      eventName,
      buyerEmail,
      buyerName,
      tickets,
      successPath,
      cancelPath,
    } = body;

    if (!eventId || !buyerEmail || !tickets?.length) {
      return NextResponse.json(
        { error: "Missing ticket checkout details." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const lineItems = tickets.map((line: any) => ({
      quantity: Number(line.quantity || 1),
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(line.price || 0) * 100),
        product_data: {
          name: `${eventName || "OutsideCrowd Event"} — ${line.name || "Ticket"}`,
          description: line.description || "Event ticket",
        },
      },
    }));

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
        tickets: JSON.stringify(tickets),
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
