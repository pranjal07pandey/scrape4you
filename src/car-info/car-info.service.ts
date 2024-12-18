import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CarDetailsService } from '../car-details.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CarInfoService {
    private readonly apiUrl = process.env.DVLA_MAIN_URL;
    private readonly apiKey = process.env.DVLA_MAIN_KEY;

    constructor(private readonly carDetailsService: CarDetailsService) {}

    async getCarDetails(formData:any): Promise<any> {
        const registrationNumber = formData.registrationNumber.replace(/\s+/g, '').toUpperCase()
        console.log("the input reg number is: ", registrationNumber)
        try {
            const response = await axios.post(`${this.apiUrl}`, 
              {
                registrationNumber,
              },
              {
                headers: {
                  'x-api-key': this.apiKey,
                },
              }
            );

          const car_details = response.data;

          // Store car details in the database
          const uniqueId = uuidv4();
          const carData = {
            registrationNumber: car_details.registrationNumber,
            make: car_details.make,
            model: 'sample_model',
            yearOfManufacture: car_details.yearOfManufacture,
            color: car_details.colour,
            motStatus: car_details.motStatus,
            fuelType: car_details.fuelType,

            // form data
            postcode: formData.postcode,
            problem: formData.problem,
            phoneNumber: formData.phoneNumber,
            carImage: formData.carImage,

            uniqueId: uniqueId // add unique id to the database entry
            
          };

          // Save to MongoDB
          await this.carDetailsService.create(carData);

          // console.log(response.status)

          return {'status': response.status, 'statusText': response.statusText, 'uniqueId': carData.uniqueId};

          
        } catch (error) {
          throw new HttpException(
            error.response?.data?.message || 'Failed to fetch car details',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

    async markAsSold(id: string): Promise<any> {
      return this.carDetailsService.markAsSold(id);
      }

    async getAllListing(): Promise<any>{
      const allListing = await this.carDetailsService.findAll();
      console.log(allListing);
      return allListing;
    }

    async getFormByUniqueId(uniqueId: string): Promise<any>{
      return await this.carDetailsService.getFormByUniqueId(uniqueId);
    }

    async updateFormByUniqueId(uniqueId: string, updatedData:any): Promise<any>{
      return await this.carDetailsService.updateFormByUniqueId(uniqueId, updatedData);
    }

    async deleteFormByUniqueId(uniqueId: string): Promise<any>{
      return await this.carDetailsService.deleteFormByUniqueId(uniqueId);
    }
    

}
