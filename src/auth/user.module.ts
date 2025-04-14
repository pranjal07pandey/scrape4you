import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import {CarDetails, CarDetailsSchema} from '../car-details.schema';
import { CarDetailsModule } from 'src/car-details.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
    { name: CarDetails.name, schema: CarDetailsSchema }

  ])],

  providers: [UserService],
  exports: [UserService],  // Make sure UserService is exported
})
export class UserModule {}
