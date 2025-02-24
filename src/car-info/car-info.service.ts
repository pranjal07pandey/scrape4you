import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CarDetailsService } from '../car-details.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CarInfoService {
    private readonly apiUrl = process.env.DVLA_MAIN_URL;
    private readonly apiKey = process.env.DVLA_MAIN_KEY;
    private readonly POSTCODE_API_URL = 'https://api.postcodes.io/postcodes';

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

          //Fetch latitude and longitude from postcode
          let latitude = null;
          let longitude = null;
          let country = null;
          let region = null;
          let parliamentary_constituency = null;
          let admin_district = null;
          let parish = null;
          let full_location = ""


          try{
            const locationResponse = await axios.get(`${this.POSTCODE_API_URL}/${encodeURIComponent(formData.postcode)}`);
            latitude = locationResponse.data.result.latitude;
            longitude = locationResponse.data.result.longitude;
            country = locationResponse.data.result.country;
            region = locationResponse.data.result.region;
            parliamentary_constituency = locationResponse.data.result.parliamentary_constituency;
            admin_district = locationResponse.data.result.admin_district;
            parish = locationResponse.data.result.parish;

            full_location = parish +", "+ admin_district +", "+ parliamentary_constituency +", "+ region +", "+ country


          }catch(error){
            console.error("Failed to fetch coordinates:", error.message);
            throw new HttpException(
              'Invalid postcode provided. Please enter a correct UK postcode.',
              HttpStatus.BAD_REQUEST
            )
          }

          // Assign "scrape" or "salvage" tag with 50-50 probability
          const tag = Math.random() < 0.5 ? "scrape" : "salvage";

          // Store car details in the database
          const uniqueId = uuidv4();
          const carData = {
            registrationNumber: car_details.registrationNumber,
            make: car_details.make,
            model: 'sample_model',
            yearOfManufacture: car_details.yearOfManufacture,
            color: car_details.colour,
            motStatus: car_details.motStatus,
            motExpiryDate: car_details.motExpiryDate,
            fuelType: car_details.fuelType,
            engineCapacity: car_details.engineCapacity,

            // form data
            postcode: formData.postcode,
            latitude,
            longitude,
            fullAddress: full_location, 
            problem: formData.problem,
            phoneNumber: formData.phoneNumber,
            carImage: formData.carImage,
            tag: tag,
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
