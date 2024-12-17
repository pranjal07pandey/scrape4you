import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CarDetailsService } from '../car-details.service';

@Injectable()
export class CarInfoService {
    private readonly apiUrl = process.env.DVLA_TEST_URL;
    private readonly apiKey = process.env.DVLA_TEST_KEY;

    constructor(private readonly carDetailsService: CarDetailsService) {}

    async getCarDetails(formData:any): Promise<any> {
        const registrationNumber = formData.registrationNumber.replace(/\s+/g, '').toUpperCase()
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
            

          };

          // Save to MongoDB
          await this.carDetailsService.create(carData);

          // console.log(response.status)

          return {'status': response.status, 'statusText': response.statusText};

          
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

    

}
