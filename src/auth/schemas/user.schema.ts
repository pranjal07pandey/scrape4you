import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { now } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'None' })
  is_subscribed: string;  // 'scrape', 'salvage', 'None'

  @Prop({ default: now })
  date_created: Date;

  @Prop({ default: now })
  date_updated: Date;

  @Prop({default: 'https://salvage-motors.s3.eu-west-2.amazonaws.com/default_avatar.png'})
  profile_image: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
