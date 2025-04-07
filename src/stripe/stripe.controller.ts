import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    RawBodyRequest,
    Headers,
    UseGuards
} from '@nestjs/common';
  import { StripeService } from './stripe.service';
  import { AuthGuard } from '@nestjs/passport';
  import { User } from 'src/auth/user.decorator';
  import { UserService } from '../auth/user.service';
import { publicDecrypt } from 'crypto';

  
  
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
        // Create a customer
        const customer = await this.stripeService.createCustomer(email);

        // Step 2: Create a subscription for the customer
        const subscription = await this.stripeService.createSubscription(customer.id, priceId);

        const subscriptionTypes = [
          {
            id: 'price_1R15A1DnmorUxCln7W0DslGy',
            name: 'Salvage Monthly',
            price: 170,
            interval: 'month', // Added for clarity
          },
          {
            id: 'price_1R57DZDnmorUxClnRG48rfKZ',
            name: 'Salvage Weekly',
            price: 50,
            interval: 'week',
          },
          {
            id: 'price_1R573DDnmorUxClnp4X4Imki',
            name: 'Scrap Monthly',
            price: 170,
            interval: 'month',
          },
          {
            id: 'price_1R57CnDnmorUxClnS97UhVMT',
            name: 'Scrap Weekly',
            price: 50,
            interval: 'week',
          },
          {
            id: 'price_1R9a3xDnmorUxClnuwyFYx1B',
            name: 'Corporate Salvage',
            price: 300,
            interval: 'month',
          },
          {
            id: 'price_1R9a2eDnmorUxCln8q94c9Xg',
            name: 'Corporate Scrap',
            price: 300,
            interval: 'month',
          }
        ]

            let purchasedSubscription:string = '';
            if(subscription){
              for (const subs of subscriptionTypes){
                if(priceId === subs.id){
                  purchasedSubscription = subs.name;
                }
            }
          }

          if (purchasedSubscription){
            await this.userService.updateSubs(userId, { is_subscribed: purchasedSubscription });
            return subscription;
          }

      }
      catch (err) {
        throw new Error(err.message);
      }

    }

    // new apis
    @Post('cancel-subscription')
    async cancelSubscription(@Body() body: {subscriptionID: string}){
      const {subscriptionID} = body;
      return await this.stripeService.cancelSubscription(subscriptionID);
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