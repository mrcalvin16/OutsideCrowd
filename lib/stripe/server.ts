import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  stripeClient = new Stripe(apiKey);

  return stripeClient;
}
