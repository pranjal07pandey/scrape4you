// quotes/quotes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote } from './quote.schema';

@Injectable()
export class QuotesService {
  constructor(@InjectModel(Quote.name) private quoteModel: Model<Quote>) {}

  async createQuote(listingId: string, agentId: string, amount: number, message: string) {
    const quote = new this.quoteModel({ listingId, agentId, amount, message });
    return quote.save();
  }

  async getQuotesForListing(listingId: string) {
    return this.quoteModel.find({ listingId }).sort({ amount: -1 }).exec();
  }

  async getQuotesForAgents(agentId: string) {
    return this.quoteModel.find({ agentId }).sort({ createdAt: -1 }).exec();
  }
}