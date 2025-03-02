import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { CarDetailsModule } from 'src/car-details.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  forwardRef(() => CarDetailsModule)],
  providers: [UserService],
  exports: [UserService, MongooseModule],  // Make sure UserService is exported
})
export class UserModule {}
