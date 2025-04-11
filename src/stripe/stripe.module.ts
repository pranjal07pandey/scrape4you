import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { UserModule } from 'src/auth/user.module';
import { WebhookController } from './webhooks.controller';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  imports: [UserModule],
  controllers: [StripeController, WebhookController],
  providers: [StripeService, StripeWebhookService],
})
export class StripeModule {

}