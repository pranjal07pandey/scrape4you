import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarInfoService } from './car-info/car-info.service';
import { CarInfoController } from './car-info/car-info.controller';

@Module({
  imports: [],
  controllers: [AppController, CarInfoController],
  providers: [AppService, CarInfoService],
})
export class AppModule {}
