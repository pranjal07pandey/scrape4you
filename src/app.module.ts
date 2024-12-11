import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarInfoService } from './car-info/car-info.service';
import { CarInfoController } from './car-info/car-info.controller';

import { ConfigModule } from '@nestjs/config';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MongooseModule } from '@nestjs/mongoose';

import { CarDetails, CarDetailsSchema } from './car-details.schema'; // Import the schema
import { CarDetailsService } from './car-details.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'scrape_frontend', 'build'), // Path to React build folder
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    MongooseModule.forFeature([{ name: CarDetails.name, schema: CarDetailsSchema }]), // Register the schema
  ],
  controllers: [AppController, CarInfoController],
  providers: [AppService, CarInfoService, CarDetailsService],
})
export class AppModule {}
