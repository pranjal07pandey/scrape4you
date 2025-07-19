import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { now } from 'mongoose';
import { Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'None' })
  is_subscribed: string;  // 'scrape', 'salvage', 'None'

  @Prop({ default: now })
  date_created: Date;

  @Prop({ default: now })
  date_updated: Date;

  // https://salvage-motors.s3.eu-west-2.amazonaws.com/default_avatar.png
  @Prop({default: 'N/A'})
  profile_image: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'CarDetails' }], default: [] })
  favorites: Types.ObjectId[];

  @Prop({ type: [String], required: true, default: [] })
  active_devices: string[];

  // New: Track login attempts for cooldown enforcement
  @Prop({
    type: [{
      timestamp: { type: Date, required: true },
      deviceId: { type: String, required: true },
    }],
    default: [],
  })
  login_attempts: Array<{ timestamp: Date; deviceId: string }>;


  // new changes for webhooks
  @Prop({ index: true })
  stripeCustomerId: string;  // Stores Stripe customer ID (e.g., 'cus_ABC123DEF456')

  @Prop()
  subscriptionId: string;  // Stores Stripe subscription ID (e.g., 'sub_XYZ789ABC123')

  @Prop()
  subscriptionStatus: string;  // 'active', 'past_due', 'canceled', etc.

  @Prop()
  currentPeriodEnd: Date;  // When current billing period ends

  @Prop()
  subscriptionEndedAt: Date;  // When subscription was canceled

  // implementing user block
  @Prop({default: false})
  is_blocked: boolean;

  @Prop({ default: 0 })
  login_violations: number; // Track number of violations

  @Prop()
  lockout_until: Date; // When the lockout expires

  // message to admins
  @Prop({default: ''})
  unblock_message: string;

  // add fcm_token
  @Prop()
  fcm_token: string;

  @Prop()
  latitude: string;

  @Prop()
  longitude: string;

  @Prop()
  distance_filter: number;

  @Prop({default: false})
  is_guest : boolean

}

export const UserSchema = SchemaFactory.createForClass(User);
