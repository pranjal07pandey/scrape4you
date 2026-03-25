// quotes/quotes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote } from './quote.schema';

@Injectable()
export class QuotesService {
  constructor(@InjectModel(Quote.name) private quoteModel: Model<Quote>) {}

  async createQuote(data: Record<string, any>) {
    try {
      console.log('Saving quote:', data);
      const quote = new this.quoteModel(data);
      const saved = await quote.save();
      console.log('Quote saved successfully:', saved._id);
      return saved;
    } catch (err) {
      console.error('Failed to save quote:', err.message);
      throw err;
    }
  }

  async getQuotesForListing(listingId: string) {
    return this.quoteModel.find({ listingId }).sort({ amount: -1 }).exec();
  }

  async getQuotesForAgents(agentId: string) {
    return this.quoteModel.find({ agentId }).sort({ createdAt: -1 }).exec();
  }
}