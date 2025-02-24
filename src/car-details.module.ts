import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarDetails, CarDetailsSchema } from './car-details.schema';
import { CarDetailsService } from './car-details.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CarDetails.name, schema: CarDetailsSchema }]),
  ],
  providers: [CarDetailsService],
  exports: [MongooseModule],
})
export class CarDetailsModule {}
