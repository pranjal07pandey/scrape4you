// src/payments/stripe-webhook.service.ts
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event);
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event);
        break;
      // Add more event types as needed
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    // Update your database, send confirmation emails, etc.
  }

  private async handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.error(`Payment failed: ${paymentIntent.id}`);
    console.log(`Payment failed: ${paymentIntent.id}`);
    // Handle failed payment
  }

  private async handleChargeRefunded(event: Stripe.Event) {
    const charge = event.data.object as Stripe.Charge;
    this.logger.log(`Charge refunded: ${charge.id}`);
    console.log(`Charge refunded: ${charge.id}`);
    // Update your database
  }
}