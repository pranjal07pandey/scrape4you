// schemas/quote.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Quote extends Document {
  @Prop({ required: true })
  listingId: string;

  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true })
  amount: number; // Only storing the amount as requested

  @Prop({required: false})
  message: string;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);