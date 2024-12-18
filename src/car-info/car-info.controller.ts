import { Controller, Post, Get, Body, BadRequestException, Patch, Param, HttpStatus, HttpException, Put, Delete} from '@nestjs/common';
import { CarInfoService } from './car-info.service';
import { Twilio } from 'twilio';
import { Injectable, NotFoundException } from '@nestjs/common';

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
      const baseUrl = 'https://scrape4you.onrender.com/edit-form/'
      const editLink = `${baseUrl}${carDetails.uniqueId}`
      const message = `Hello, your information has been saved successfully. Our agent will contact you soon. In order to edit or delete your posting go to ${editLink}`;
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

      // return{
      //   success: true,
      //   message: 'added successfully.',
      //   carDetails
      // }

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

  @Get('get-data/:uniqueId')
  async getForm(@Param('uniqueId') uniqueId: string) {
    return this.carInfoService.getFormByUniqueId(uniqueId);
  }

  @Put('edit-form/:uniqueId')
  async updateForm(
    @Param('uniqueId') uniqueId: string,
    @Body() updatedData: any,) {
    
      try {
        const carDetails = this.carInfoService.updateFormByUniqueId(uniqueId, updatedData);
        return{
          success: true,
          message: 'updated successfully.',
          carDetails
        }
        
      } catch (error) {  
        console.error('Error deleting the form:', error);
        throw new HttpException('Failed to delete the data.', HttpStatus.INTERNAL_SERVER_ERROR);
      
      }
    
     
  }

  @Delete('delete-data/:uniqueId')
  async deleteForm(@Param('uniqueId') uniqueId: string) {
    try {
      const details =  this.carInfoService.deleteFormByUniqueId(uniqueId);
    return{
      success: true,
      message: 'deleted successfully.',
      details
    }
      
    } catch (error) {
      console.error('Error deleting the form:', error);
      throw new HttpException('Failed to delete the data.', HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }


}
