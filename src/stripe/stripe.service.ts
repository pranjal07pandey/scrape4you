import { Injectable } from '@nestjs/common';
import {Stripe} from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    // Initialize Stripe with your secret key
    this.stripe = new Stripe('sk_test_51GzlwoDnmorUxCln6DMp4mwAKJF6se2kCMzFshXd7TWy2ii4UHZKFsSkXKTQSmo2AAJr1EGoTch3DSZhjRXY6iZq00CPDHzDjJ', {
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
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }

}