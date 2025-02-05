import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CarDetailsDocument = CarDetails & Document;

@Schema()
export class CarDetails {
  @Prop({ required: true })
  registrationNumber: string;

  @Prop({ required: true })
  make: string;

  @Prop()
  model: string;

  @Prop()
  yearOfManufacture: string;

  @Prop()
  color: string;

  @Prop()
  motStatus: string;

  @Prop()
  fuelType: string;

  @Prop()
  engineCapacity: number;

  @Prop()
  motExpiryDate: string;

  // fields from user form
  @Prop({ required: true })
  postcode: string;

  @Prop()
  latitude: string;

  @Prop()
  longitude: string;

  @Prop({default: 'N/A'})
  problem: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({default: 'N/A'})
  carImage: string;

  @Prop({ required: true, enum: ['scrape', 'salvage'] })
  tag: string;

  @Prop({ default: false }) // Default to false
  isSold: boolean;

  @Prop({ default: Date.now }) // Automatically set current date and time
  date_added: Date;

  @Prop({required: true, unique:true})
  uniqueId: string;

}

export const CarDetailsSchema = SchemaFactory.createForClass(CarDetails);
