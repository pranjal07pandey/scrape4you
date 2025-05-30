// src/quotes/quote.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from './quote.schema';
import { QuotesController } from './quote.controller';
import { QuotesService } from './quote.service';
import { UserModule } from 'src/auth/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
    UserModule
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService] // Export if other modules need to use QuotesService
})
export class QuotesModule {}