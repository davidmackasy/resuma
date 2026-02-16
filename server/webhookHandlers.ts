import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { sql } from 'drizzle-orm';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    try {
      const stripe = await getUncachableStripeClient();
      const webhookSecret = sync.webhookSigningSecret;

      if (!webhookSecret) {
        console.warn('No webhook signing secret available, skipping custom event handling');
        return;
      }

      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      await WebhookHandlers.handleCustomEvent(event);
    } catch (error) {
      console.error('Error in custom webhook handler:', error);
    }
  }

  static async handleCustomEvent(event: any): Promise<void> {
    const type = event.type;
    const data = event.data?.object;

    if (!data) return;

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const customerId = data.customer;
        const subscriptionId = data.id;
        const status = data.status;

        await db.execute(
          sql`UPDATE users SET stripe_subscription_id = ${subscriptionId}, subscription_status = ${status}, updated_at = NOW() WHERE stripe_customer_id = ${customerId}`
        );
        console.log(`Subscription ${type}: customer=${customerId}, status=${status}`);
        break;
      }

      case 'invoice.paid': {
        const customerId = data.customer;
        if (data.billing_reason === 'subscription_cycle') {
          const userResult = await db.execute(
            sql`SELECT id FROM users WHERE stripe_customer_id = ${customerId}`
          );
          const userId = (userResult.rows?.[0] as any)?.id;
          if (userId) {
            await db.execute(
              sql`UPDATE applykit_usage SET applications_generated = 0, regenerations = 0 WHERE user_id = ${userId}`
            );
            console.log(`Usage reset for user ${userId} on invoice.paid (subscription_cycle)`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const customerId = data.customer;
        console.log(`Payment failed for customer: ${customerId}`);
        break;
      }

      case 'checkout.session.completed': {
        const customerId = data.customer;
        const subscriptionId = data.subscription;
        if (subscriptionId) {
          await db.execute(
            sql`UPDATE users SET stripe_subscription_id = ${subscriptionId}, subscription_status = 'active', updated_at = NOW() WHERE stripe_customer_id = ${customerId}`
          );
          console.log(`Checkout completed: customer=${customerId}, subscription=${subscriptionId}`);
        }
        break;
      }
    }
  }
}
