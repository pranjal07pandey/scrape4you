import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarDetails, CarDetailsSchema } from './car-details.schema';
import { CarDetailsService } from './car-details.service';
import { UserModule } from './auth/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CarDetails.name, schema: CarDetailsSchema }])
  ],
  providers: [CarDetailsService],
  exports: [CarDetailsService],
})
export class CarDetailsModule {}
