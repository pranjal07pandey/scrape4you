import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards, HttpException, HttpStatus
} from '@nestjs/common';
  import { StripeService } from './stripe.service';
  import { AuthGuard } from '@nestjs/passport';
  import { User } from 'src/auth/user.decorator';
  import { UserService } from '../auth/user.service';

  
  
  @Controller('stripe')
  export class StripeController {
    constructor(
      private readonly stripeService: StripeService,
      private readonly userService: UserService,

    ) {}
  
    // Fetch all products
    @Get('products')
    async getProducts() {
      return this.stripeService.getProducts();
    }
  
    // Create a subscription
    @Post('create-customer-and-subscription')
    @UseGuards(AuthGuard('jwt'))
    async createSubscription(@User() user:any, @Body() body: { email: string; priceId: string }) {

      const userId = user._id;
      console.log('User id is-----------> ', userId);
      
      const { email, priceId } = body;
  
      try{
        // Create or get existing customer
        let customer = await this.stripeService.findCustomerByEmail(email);
        if (!customer) {
          customer = await this.stripeService.createCustomer(email);
        }

        // Store customer ID in user record
        await this.userService.update(userId, { stripeCustomerId: customer.id });

        // Step 2: Create a subscription for the customer
        return await this.stripeService.createSubscription(customer.id, priceId);

      }
      catch (err) {
        throw new Error(err.message);
      }

    }

    // new apis
    @Post('cancel-subscription')
    @UseGuards(AuthGuard('jwt'))
    async cancelSubscription(@User() user:any, @Body() body: {subscriptionID: string, cancelImmediately?: boolean}){
      const {subscriptionID, cancelImmediately = false} = body;
      const userId = user._id;

      try {
        // 1. Request cancellation from Stripe
      const cancelledSubscription = await this.stripeService.cancelSubscription(
        subscriptionID,
        cancelImmediately
      );

      // 2. Update local status to reflect pending cancellation
      await this.userService.updateSubs(userId, {
        subscriptionStatus: cancelledSubscription.status, // Will be 'active' but canceling
        is_subscribed: cancelledSubscription.cancel_at_period_end 
          ? 'pending_cancellation' 
          : 'None',
        subscriptionEndedAt: cancelledSubscription.cancel_at_period_end
          ? new Date(cancelledSubscription.current_period_end * 1000)
          : new Date()
      });

      // 3. Return the Stripe subscription object
      return {
        message: cancelImmediately 
          ? 'Subscription canceled immediately' 
          : 'Subscription will cancel at period end',
        subscription: cancelledSubscription
      };
 
      } catch (error) {
        throw new HttpException(
          `Failed to cancel subscription: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

    }

    @Post('check-subscription')
    async checkSubscription(@Body() body: {email: string}){
      const {email} = body;
      return await this.stripeService.checkSubscription(email);
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

    @Get('keys')
    async getStripKeys(){
      return {
        publishedKey: process.env.STRIPE_PUBLIC_KEY,
        merchantIdentifier: '',
        urlScheme: ''
      }
    }
}