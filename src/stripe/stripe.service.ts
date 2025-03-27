import { Injectable } from '@nestjs/common';
import {Stripe} from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor() {
    // Initialize Stripe with your secret key
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: null, // Use the latest API version
    });
  }

  // Fetch all products with their prices
  async getProducts() {
    const products = await this.stripe.products.list({
      expand: ['data.default_price'], // Include the default price for each product
      active: true, // Only fetch active products
    });

    return products.data;
  }

  // Create a customer
  async createCustomer(email: string) {
    return this.stripe.customers.create({ email });
  }

  // Create a subscription
  async createSubscription(customerId: string, priceId: string) {
      const subscription =  await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
        payment_behavior: 'default_incomplete', // For handling payment setup
      });

      // Type assertion to ensure `latest_invoice` is an expanded Invoice object
      const latestInvoice = subscription.latest_invoice as Stripe.Invoice & {
        payment_intent: Stripe.PaymentIntent;
      };

      return {
        customerId: customerId,
        subscriptionId: subscription.id,
        clientSecret: latestInvoice.payment_intent.client_secret,
      };

      
    }

  
  // cancel a subscription
    async cancelSubscription(subscriptionId: string){
      try{
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
      catch(error){
        throw new Error(error.message);
      }
    }

    //  check subscription
    async checkSubscription(email: string){
      try {
        // return await this.stripe.subscriptions.list({customer: customerID, status: 'active'})
        // 1. Find customer in Stripe
          const customer = await this.stripe.customers.list({
            email: email,
            limit: 1
          });

          // console.log("Customer is------>", customer);

          if (customer.data.length === 0) {
            return ({ hasSubscription: false });
          }

          // 2. Check for active subscriptions
          const subscriptions = await this.stripe.subscriptions.list({
            customer: customer.data[0].id,
            status: 'active',
            limit: 1
          });

          // 3. Return subscription status
          const hasActiveSubscription = subscriptions.data.length > 0;
          return {
            hasSubscription: hasActiveSubscription,
            status: hasActiveSubscription ? subscriptions.data[0].status : null,
            currentPeriodEnd: hasActiveSubscription ? subscriptions.data[0].current_period_end : null,
            plan: hasActiveSubscription ? subscriptions.data[0].items.data[0].plan : null
          };

      } catch (error) {
        throw new Error(error.message);
      }
    }

    async createEphemeralKey(customerId: string) {
      return this.stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2023-08-16'},
      );
    }

    async createPaymentIntent(amount: number, currency: string) {
      return this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }  
  

}