import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Otp extends Document {
  @Prop({ required: true, index: true })
  phone: string;

  @Prop({ required: true })
  code: string; // Hashed OTP

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: false, index: true })
  used: boolean;

//   @Prop()
//   userId?: string; // Optional reference to user
}

export const OtpSchema = SchemaFactory.createForClass(Otp);