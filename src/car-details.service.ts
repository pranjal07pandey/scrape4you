import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarDetails, CarDetailsDocument } from './car-details.schema';

@Injectable()
export class CarDetailsService {
  constructor(
    @InjectModel(CarDetails.name)
    private carDetailsModel: Model<CarDetailsDocument>,
  ) {}

  async create(details: Partial<CarDetails>): Promise<CarDetails> {
    const newCarDetails = new this.carDetailsModel(details);
    return newCarDetails.save();
  }

  async findAll(): Promise<CarDetails[]> {
    return this.carDetailsModel.find().exec();
  }

  async findOne(registrationNumber: string): Promise<CarDetails | null> {
    return this.carDetailsModel.findOne({ registrationNumber }).exec();
  }

  async markAsSold(id: string): Promise<CarDetails> {
    return this.carDetailsModel.findByIdAndUpdate(id, { isSold: true }, { new: true });
  }
}
