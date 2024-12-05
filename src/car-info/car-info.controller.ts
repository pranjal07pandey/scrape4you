import { Controller, Post, Get, Body, BadRequestException, Patch, Param } from '@nestjs/common';
import { CarInfoService } from './car-info.service';

@Controller('car')
export class CarInfoController {

  constructor(private readonly carInfoService: CarInfoService) {}

  @Post('submit-form')
  async getCarDetails(@Body() fromData: any) {

    console.log(fromData)

    if (!fromData.registrationNumber) {
      throw new BadRequestException('Registration number is required');
    }   

   return this.carInfoService.getCarDetails(fromData);

  }

  @Patch(':id/mark-sold')
  async markCarAsSold(@Param('registration-num') id: string) {
    const updatedCar = await this.carInfoService.markAsSold(id);
    return {
      message: 'Car marked as sold successfully',
      data: updatedCar,
    };
  }

  @Get('get-all-listing')
  async getAllListings(){
    return this.carInfoService.getAllListing()
  }


}
