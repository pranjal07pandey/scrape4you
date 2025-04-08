import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { UserModule } from 'src/auth/user.module';

@Module({
  imports: [UserModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {

}