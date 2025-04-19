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
    @Body('amount') amount: number,
    @Body('message') message: string,

  ) {
    return this.quotesService.createQuote(listingId, agentId, amount, message);
  }

  @Get(':listingId')
  async getClientQuotes(@Param('listingId') listingId: string) {
    return this.quotesService.getQuotesForListing(listingId);
  }

  @Get('agent/:agentId')
  async getAgentQuotes(@Param('agentId') agentId: string){
    return this.quotesService.getQuotesForAgents(agentId);
  }
}