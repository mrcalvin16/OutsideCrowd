import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/server";

const BOOST_PLANS: Record<
  string,
  {
    name: string;
    amount: number;
    durationDays: number;
    featuredWeight: number;
  }
> = {
  spotlight: {
    name: "OutsideCrowd Spotlight Boost",
    amount: 1500,
    durationDays: 1,
    featuredWeight: 100,
  },

  weekend_push: {
    name: "OutsideCrowd Weekend Push Boost",
    amount: 3500,
    durationDays: 3,
    featuredWeight: 250,
  },

  city_takeover: {
    name: "OutsideCrowd City Takeover Boost",
    amount: 7500,
    durationDays: 7,
    featuredWeight: 500,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { eventId, tier } = body;

    if (!eventId || !tier || !BOOST_PLANS[tier]) {
      return NextResponse.json(
        { error: "Invalid boost request." },
        { status: 400 }
      );
    }

    const plan = BOOST_PLANS[tier];

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "usd",

            unit_amount: plan.amount,

            product_data: {
              name: plan.name,

              description: `${plan.durationDays}-day promoted event placement`,
            },
          },
        },
      ],

      metadata: {
        eventId,
        tier,
        durationDays: String(plan.durationDays),
        featuredWeight: String(plan.featuredWeight),
      },

      success_url: `${appUrl}/host/boost?eventId=${eventId}&boost=success`,
      cancel_url: `${appUrl}/host/boost?eventId=${eventId}&boost=cancelled`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Boost checkout error:", error);

    return NextResponse.json(
      {
        error: "Unable to create checkout session.",
      },
      {
        status: 500,
      }
    );
  }
}
