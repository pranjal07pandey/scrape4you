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
    const quotes =  await this.quotesService.createQuote(listingId, agentId, amount, message);

    //send sms notification
    const baseUrl = 'https://scrape4you.onrender.com/list-quotes/';
    const localUrl = 'http://localhost:5000/list-quotes/'
    const quotesLink = `${localUrl}${quotes._id}/${listingId}`;
    const userMsg = `Hello, you have received a new quote of ${amount}. Click this link to view the details: ${quotesLink}`

    return {
      success: true,
      message: "quote submitted successfully",
      userMsg: userMsg
    }

  }

  @Get(':listingId')
  async getClientQuotes(@Param('listingId') listingId: string) {
    const quotes = await this.quotesService.getQuotesForListing(listingId);

    const filteredData = quotes.map((item: any) => ({
      agentName: "Test",
      agentContact: "12345",
      amount: item.amount,
      message: item.message || '', // handles cases where message is missing
      created_at: item.createdAt
    }));

    return filteredData;

  }

  @Get('agent/:agentId')
  async getAgentQuotes(@Param('agentId') agentId: string){
    return await this.quotesService.getQuotesForAgents(agentId);
  }
}