import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    RawBodyRequest,
    Headers,
} from '@nestjs/common';
  import { StripeService } from './stripe.service';
  
  @Controller('stripe')
  export class StripeController {
    constructor(private readonly stripeService: StripeService) {}
  
    // Fetch all products
    @Get('products')
    async getProducts() {
      return this.stripeService.getProducts();
    }
  
    // Create a subscription
    @Post('create-subscription')
    async createSubscription(@Body() body: { email: string; priceId: string }) {
      const { email, priceId } = body;
  
      // Create a customer
      const customer = await this.stripeService.createCustomer(email);
  
      // Create a subscription
      const subscription = await this.stripeService.createSubscription(customer.id, priceId);
  
      return { subscription };
    }
  
  }