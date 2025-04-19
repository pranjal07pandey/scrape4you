import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import {CarDetails, CarDetailsSchema} from '../car-details.schema';
import { Otp, OtpSchema } from './schemas/otp.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
    { name: CarDetails.name, schema: CarDetailsSchema },
    {name: Otp.name, schema: OtpSchema}
  ])],

  providers: [UserService],
  exports: [UserService],  // Make sure UserService is exported
})
export class UserModule {}
