// quotes/quotes.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QuotesService } from './quote.service';
import { UserService } from 'src/auth/user.service';
import { Twilio } from 'twilio';

@Controller('quotes')
export class QuotesController {
  private twilioClient: Twilio;
  constructor(
    private readonly quotesService: QuotesService,
    private readonly userService:  UserService,
  )
  {
    this.twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
  }

  @Post('create')
  async createQuote(
    @Body('listingId') listingId: string,
    @Body('agentId') agentId: string,
    @Body('amount') amount: number,
    @Body('message') message: string,

  ) {

    const customerPhone = '+447887770243'

    const createQuote = await this.quotesService.createQuote(listingId, agentId, amount, message);
    //send sms notification
    const baseUrl = 'https://scrape4you.onrender.com/list-quotes/';
    const localUrl = 'http://localhost:5000/list-quotes/'
    const quotesLink = `${baseUrl}${listingId}/${agentId}`;
    const userMsg = `Hello, you have received a new quote of ${amount}. Click this link to view the details: ${quotesLink}`

    if (createQuote){
      await this.twilioClient.messages.create({
        to: customerPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: userMsg
      });

      return {
      success: true,
      message: "quote submitted successfully",
      userMsg: userMsg
    }

  }

  else{
    return{success: false, message: "quote sent failed."}
  }

  }

  @Get(':listingId/:agentId')
  async getClientQuotes(@Param('listingId') listingId: string, @Param('agentId') agentId: string) {
    const quotes = await this.quotesService.getQuotesForListing(listingId);

    const agent = await this.userService.findById(agentId)
    const agentName = agent.first_name + ' ' + agent.last_name;
    const agentContact = agent.phone;
  
    const filteredData = quotes.map((item: any) => ({
      agentName: agentName,
      agentContact: agentContact,
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