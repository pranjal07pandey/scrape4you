import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { UserModule } from 'src/auth/user.module';
import { WebhookController } from './webhooks.controller';
// Import the module that provides CarDetailsModel
@Module({
  imports: [UserModule],
  controllers: [StripeController, WebhookController],
  providers: [StripeService],
})
export class StripeModule {

}