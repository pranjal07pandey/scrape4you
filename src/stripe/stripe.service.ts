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
        // 1. Find customer in Stripe
        const customers = await this.stripe.customers.list({ email, limit: 100 });
          if (customers.data.length === 0) {
            return ({ hasSubscription: false });
          }

          // 2. Check for active subscriptions
          const activeSubscriptions = [];
          for (const customer of customers.data){
            const subscriptions = await this.stripe.subscriptions.list({
              customer: customer.id,
              status: 'active',
              limit: 1
            });
          
          if (subscriptions.data.length > 0) {
            activeSubscriptions.push(...subscriptions.data);
          }
        }


        // 3. Return early if no active subscriptions
        if (activeSubscriptions.length === 0) {
          return { hasSubscription: false };
        }

      
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
          ]

          // 5. Map subscriptions to your custom plans
          const subscriptions = activeSubscriptions.map((sub) => {
          const planId = sub.plan.id;
          const matchedPlan = subscriptionTypes.find((plan) => plan.id === planId);

              return {
                status: sub.status,
                currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
                plan: matchedPlan || { 
                  id: planId, 
                  name: 'Unknown Plan', 
                  price: 0, 
                  interval: 'N/A' 
                }, // Fallback if plan not in your list
              };
            });


          // 6. Final response (frontend-friendly)
          return {
            hasSubscription: true,
            subscriptions, // Array of all active subscriptions with clean plan data
        }
        

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