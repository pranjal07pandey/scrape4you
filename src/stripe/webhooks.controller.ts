// src/payments/webhooks.controller.ts
import { Controller, Post, Req, Res, Headers, RawBodyRequest, Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { UserService } from '../auth/user.service';


@Controller()
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  @Post('/webhook/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    // Debug logging (temporary)
    console.log('Raw body length:', request.rawBody?.length);
    console.log('Signature header:', signature);

    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new Error('Missing stripe-signature header');
    }

    //
    console.log("Hit the webhook/stripe api...", request.rawBody);

    let event: any;
    try {
       event = this.stripeService.constructEvent(
        request.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
    } catch (err) {
      this.logger.error(`Verification failed. Raw body start: ${request.rawBody?.toString().substring(0, 100)}`);
      this.logger.error(`Signature: ${signature}`);
      this.logger.error(`Webhook secret: ${process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 5)}...`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received event: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionChange(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        // Add more event handlers as needed
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      res.status(500).json({ error: error.message });
    }

  }

  private async handleSubscriptionChange(subscription) {

    this.logger.warn(`Hit the handleSubscriptionChange api via webhook.. ${subscription}`);
    console.log('Hit the handleSubscriptionChange api via webhook..');

    const customerId = subscription.customer as string;
    const planId = subscription.items.data[0].price.id;
    
    // Find user by customer ID (you might need to store this mapping in your DB)
    const user = await this.userService.findByStripeCustomerId(customerId);
    
    if (!user) {
      this.logger.warn(`User not found for customer ID: ${customerId}`);
      return;
    }

    // Update user subscription status
    await this.userService.updateSubs(user._id.toString(), {
      is_subscribed: planId,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    this.logger.log(`Updated subscription for user ${user._id}`);
  }

  private async handleSubscriptionCancelled(subscription) {

    this.logger.warn(`Hit the handleSubscriptionCancelled api via webhook.. ${subscription}`);
    console.log('Hit the handleSubscriptionCancelled api via webhook..');

    const customerId = subscription.customer as string;
    const user = await this.userService.findByStripeCustomerId(customerId);
    
    if (!user) {
      this.logger.warn(`User not found for customer ID: ${customerId}`);
      return;
    }

    await this.userService.updateSubs(user._id.toString(), {
      is_subscribed: 'None',
      subscriptionStatus: 'canceled',
      subscriptionEndedAt: new Date(),
      currentPeriodEnd: null
    });

    this.logger.log(`Cancelled subscription for user ${user._id}`);
  }

  private async handleInvoicePaid(invoice) {
    // Handle successful payment (send confirmation email, etc.)
    this.logger.log(`Invoice paid: ${invoice.id}`);
    // You might want to update payment history in your DB
  }

  private async handlePaymentFailed(invoice) {
    const customerId = invoice.customer as string;
    const user = await this.userService.findByStripeCustomerId(customerId);
    
    if (!user) {
      this.logger.warn(`User not found for customer ID: ${customerId}`);
      return;
    }

    // Notify user about payment failure
    this.logger.log(`Payment failed for user ${user._id}`);
    // You might want to implement retry logic or send an email notification
  }


}