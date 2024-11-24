import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CarInfoService } from './car-info.service';


@Controller('car-info')
export class CarInfoController {

    constructor(private readonly carInfoService: CarInfoService) {}

  @Post()
  async getCarDetails(@Body('registrationNumber') registrationNumber: string) {
    if (!registrationNumber) {
      throw new BadRequestException('Registration number is required');
    }   

   return this.carInfoService.getCarDetails(registrationNumber);

  }
}
