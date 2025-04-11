// src/payments/webhooks.controller.ts
import { Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly webhookService: StripeWebhookService
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>
  ) {
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const event = this.stripeService.constructEvent(
      request.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return this.webhookService.handleWebhook(event);
  }
}