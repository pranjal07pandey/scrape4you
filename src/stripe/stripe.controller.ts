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

    @Post('payment/sheet')
    async createPaymentSheet(@Body() body: {email: string}) {
      try {

        const {email} = body;
        
        // Step 1: Create a customer
        const customer = await this.stripeService.createCustomer(email);
  
        // Step 2: Create an ephemeral key
        const ephemeralKey = await this.stripeService.createEphemeralKey(customer.id);
  
        // Step 3: Create a PaymentIntent
        const paymentIntent = await this.stripeService.createPaymentIntent(499, 'usd'); // $4.99
  
        return {
          paymentIntent: paymentIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: customer.id,
        };
      } catch (error) {
        throw new Error(`Failed to create payment sheet: ${error.message}`);
  }
}   
}