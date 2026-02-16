import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.RESUME_STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('RESUME_STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
}

export function getStripePublishableKey(): string {
  const key = process.env.RESUME_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('RESUME_STRIPE_PUBLISHABLE_KEY is not set');
  }
  return key;
}

export function getStripePriceId(): string {
  const priceId = process.env.RESUME_STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error('RESUME_STRIPE_PRICE_ID is not set');
  }
  return priceId;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.RESUME_STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('RESUME_STRIPE_WEBHOOK_SECRET is not set');
  }
  return secret;
}
