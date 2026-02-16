import { getStripeClient } from './stripeClient';

async function seedSubscriptionProduct() {
  const stripe = getStripeClient();

  const products = await stripe.products.search({ query: "name:'Resuma Monthly Access'" });
  if (products.data.length > 0) {
    console.log('Product already exists:', products.data[0].id);
    const prices = await stripe.prices.list({ product: products.data[0].id, active: true });
    console.log('Price:', prices.data[0]?.id, '$' + (prices.data[0]?.unit_amount || 0) / 100);
    return;
  }

  const product = await stripe.products.create({
    name: 'Resuma Monthly Access',
    description: 'Full access to Resuma resume tailoring platform. Generate up to 30 AI-optimized resumes per month.',
    metadata: {
      type: 'subscription',
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  console.log('Created product:', product.id);
  console.log('Created price:', price.id, '- $9.99/month');
  console.log('Set this as RESUME_STRIPE_PRICE_ID:', price.id);
}

seedSubscriptionProduct().catch(console.error);
