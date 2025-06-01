import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CarDetailsService } from '../car-details.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CarInfoService {
    private readonly apiUrl = process.env.DVLA_MAIN_URL;
    private readonly apiKey = process.env.DVLA_MAIN_KEY;
    private readonly POSTCODE_API_URL = 'https://api.postcodes.io/postcodes';
    private readonly AWS_IMAGE_URL = 'https://car-image-database.s3.eu-west-2.amazonaws.com/';

    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;


    constructor(private readonly carDetailsService: CarDetailsService) {}

    async getCarDetails(formData:any): Promise<any> {
        const registrationNumber = formData.registrationNumber.replace(/\s+/g, '').toUpperCase()
        const accessToken = await this.getAccessToken();
        const DVLA_API_KEY = process.env.DVLA_API_KEY;

        try {
          const response = await axios.get(`https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${registrationNumber}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-API-Key': DVLA_API_KEY,
            },
          });


          const car_details = response.data;

          //Fetch latitude and longitude from postcode
          let latitude = null;
          let longitude = null;
          let country = null;
          let region = null;
          let parliamentary_constituency = null;
          let admin_district = null;
          let parish = null;
          let full_location = "";

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
          const tag = Math.random() < 0.5 ? "scrap" : "salvage";

          let randomNumber = Math.random() * 3
          randomNumber = Math.floor(randomNumber)

          // Save the images based on car make
          const displayImageURL = this.AWS_IMAGE_URL + car_details.make + `/img${randomNumber}.png`


          // Store car details in the database
          const uniqueId = uuidv4();
          const carData = {
            registrationNumber: car_details.registration,
            make: car_details.make,
            model: car_details.model,
            yearOfManufacture: car_details.manufactureDate.split("-")[0],
            color: car_details.primaryColour,
            motStatus: car_details.motTests[0].testResult,
            motExpiryDate: car_details.motTests[0].expiryDate,
            fuelType: car_details.fuelType,
            engineCapacity: car_details.engineSize,

            // form data
            postcode: formData.postcode,
            latitude,
            longitude,
            fullAddress: full_location, 
            problem: formData.problem,
            phoneNumber: formData.phoneNumber,
            carImage: formData.carImage,
            displayImage: displayImageURL,
            tag: tag,
            uniqueId: uniqueId // add unique id to the database entry
            
          };

          // Save to MongoDB
          await this.carDetailsService.create(carData);

          return {'status': response.status, 'statusText': response.statusText, 'uniqueId': carData.uniqueId,
             'make': carData.make, 'model': carData.model};
     
        } catch (error) {
          console.error('Failed to fetch car info:', error.response?.data || error.message);
          throw new Error('Failed to fetch car info');
        }


        //old logic with different api url and api key. Keeping this for reference
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
          const tag = Math.random() < 0.5 ? "scrap" : "salvage";

          let randomNumber = Math.random() * 3
          randomNumber = Math.floor(randomNumber)

          // Save the images based on car make
          const displayImageURL = this.AWS_IMAGE_URL + car_details.make + `/img${randomNumber}.png`

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
            displayImage: displayImageURL,
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

    async getSingleListing(id: string): Promise<any>{
      return await this.carDetailsService.findCarDetail(id);
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


    private async generateAccessToken(): Promise<void>{
      const clientID = process.env.DVLA_CLIENT_ID;
      const clientSecret = process.env.DVLA_CLIENT_SECRET;
      const scope = process.env.DVLA_SCOPE;
      const tokenUrl = process.env.DVLA_ACCESS_TOKEN_URL;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientID);
      params.append('client_secret', clientSecret);
      params.append('scope', scope);

      try {
        const response = await axios.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
    
        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + response.data.expires_in * 1000; // Convert to milliseconds
      } catch (error) {
        console.error('Failed to generate access token:', error.response?.data || error.message);
        throw new Error('Failed to generate access token');
      }
    }
    
    private isTokenExpired(): boolean {
      return !this.accessToken || Date.now() >= this.tokenExpiry;
    }

    async getAccessToken(): Promise<string> {
      if (this.isTokenExpired()) {
        await this.generateAccessToken();
      }
      return this.accessToken;
    }

}
