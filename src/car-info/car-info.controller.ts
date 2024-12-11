import { Controller, Post, Get, Body, BadRequestException, Patch, Param, HttpStatus, HttpException} from '@nestjs/common';
import { CarInfoService } from './car-info.service';
import { Twilio } from 'twilio';

@Controller('car')
export class CarInfoController {

  private twilioClient: Twilio;
  constructor(private readonly carInfoService: CarInfoService) {
    this.twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  }

  @Post('submit-form')
  async getCarDetails(@Body() fromData: any) {

    console.log(fromData)

    if (!fromData.registrationNumber) {
      throw new BadRequestException('Registration number is required');
    }   

    try {

      // save form data or perform business logic
      const carDetails =  await this.carInfoService.getCarDetails(fromData);

      // Send sms notification
      const message = `Hello, your information has been saved successfully. Our agent will contact you soon. Visit google.com`;
      const smsResponse = await this.twilioClient.messages.create({
        to: fromData.phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: message,
      });

      return {
        success: true,
        message: 'Form submitted successfully and SMS sent.',
        carDetails,
        smsResponse,
      };


    } catch (error) {
      
      console.error('Error processing form or sending SMS:', error);
      throw new HttpException('Failed to process form or send SMS.', HttpStatus.INTERNAL_SERVER_ERROR);

    }

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
