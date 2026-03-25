// schemas/quote.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Quote extends Document {
  @Prop({ required: false })
  listingId: string;

  @Prop({ required: false })
  agentId: string;

  @Prop({ required: false })
  amount: number;

  @Prop({ required: false })
  message: string;

  @Prop({ required: false })
  registrationNumber: string;

  @Prop({ required: false })
  postcode: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ required: false })
  problem: string;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);