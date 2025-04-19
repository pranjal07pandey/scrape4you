// quotes/quotes.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QuotesService } from './quote.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('create')
  async createQuote(
    @Body('listingId') listingId: string,
    @Body('agentId') agentId: string,
    @Body('amount') amount: number
  ) {
    return this.quotesService.createQuote(listingId, agentId, amount);
  }

  @Get(':listingId')
  async getQuotes(@Param('listingId') listingId: string) {
    return this.quotesService.getQuotesForListing(listingId);
  }
}