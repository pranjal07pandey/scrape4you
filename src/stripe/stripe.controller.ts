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
    @Post('create-customer-and-subscription')
    async createSubscription(@Body() body: { email: string; priceId: string }) {
      const { email, priceId } = body;
  
      try{
        // Create a customer
        const customer = await this.stripeService.createCustomer(email);

        // Step 2: Create a subscription for the customer
        return await this.stripeService.createSubscription(customer.id, priceId);

      }
      catch (err) {
        throw new Error(err.message);
      }

    }
  
  }