import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CarInfoService {
    private readonly apiUrl = 'https://uat.driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';
    // main url: https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles
    private readonly apiKey = 'cKLGTl0a1tKMPKxCx2bZ6J5XxP3jYD73Z1G27lB2'; // test key 
    // main key: QyX39RNox036FoNL6v4h925iahgrV2sd53sBSVtv

    async getCarDetails(registrationNumber: string): Promise<any> {
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

          return response.data;
        } catch (error) {
          throw new HttpException(
            error.response?.data?.message || 'Failed to fetch car details',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

}
