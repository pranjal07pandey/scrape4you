import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarInfoService } from './car-info/car-info.service';
import { CarInfoController } from './car-info/car-info.controller';



import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MongooseModule } from '@nestjs/mongoose';

import { CarDetails, CarDetailsSchema } from './car-details.schema'; // Import the schema
import { CarDetailsService } from './car-details.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'scrape_frontend', 'build'), // Path to React build folder
    }),
    MongooseModule.forRoot('mongodb+srv://pranjalpandey1369:LI3e0ONgurGNTLWJ@cluster0.5wv8x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {

    }),
    MongooseModule.forFeature([{ name: CarDetails.name, schema: CarDetailsSchema }]), // Register the schema
  ],
  controllers: [AppController, CarInfoController],
  providers: [AppService, CarInfoService, CarDetailsService],
})
export class AppModule {}
