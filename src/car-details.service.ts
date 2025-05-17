import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarDetails, CarDetailsDocument } from './car-details.schema';
import { User } from './auth/schemas/user.schema';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CarDetailsService {
  constructor(
    @InjectModel(CarDetails.name)
    private carDetailsModel: Model<CarDetailsDocument>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(details: Partial<CarDetails>): Promise<CarDetails> {
    const newCarDetails = new this.carDetailsModel(details);
    return newCarDetails.save();
  }

  async findAll(): Promise<CarDetails[]> {
    return this.carDetailsModel.find().exec();
  }


  async findCarDetail(_id: string): Promise<CarDetails | null> {
    return this.carDetailsModel.findById({ _id }).exec();
  }

  //update views
  async viewCar(userId: string, _id: string) {
    const car = await this.carDetailsModel.findById(_id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if user already viewed the car
    if (!car.views.includes(userObjectId)) {
      car.views.push(userObjectId);
      await car.save();
    }

    return { message: 'View recorded', totalViews: car.views.length };
  }

  async getTotalViews(_id: string) {
    const car = await this.carDetailsModel.findById(_id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return { totalViews: car.views.length };
  }

  async markAsSold(id: string): Promise<CarDetails> {
    return this.carDetailsModel.findByIdAndUpdate(id, { isSold: true }, { new: true });
  }

  // Get a form by uniqueId
  async getFormByUniqueId(uniqueId: string): Promise<CarDetails> {
    const form = await this.carDetailsModel.findOne({ uniqueId }).exec();
    if (!form) {
      throw new NotFoundException(`Form with uniqueId ${uniqueId} not found`);
    }
    return form;
  }

  // Update a form by uniqueId
  async updateFormByUniqueId(
    uniqueId: string,
    updatedData: Partial<CarDetails>,
  ): Promise<CarDetails> {
    const updatedForm = await this.carDetailsModel
      .findOneAndUpdate({ uniqueId }, updatedData, { new: true })
      .exec();
    if (!updatedForm) {
      throw new NotFoundException(`Form with uniqueId ${uniqueId} not found`);
    }
    console.log('form updated successfully..')
    return updatedForm;
  }


  // Delete a form by uniqueId
  async deleteFormByUniqueId(uniqueId: string): Promise<{ message: string }> {
    const result = await this.carDetailsModel.deleteOne({ uniqueId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Form with uniqueId ${uniqueId} not found`);
    }
    return { message: `Form with uniqueId ${uniqueId} deleted successfully` };
  }


  // get all agents
  async fetchAllAgents(){
    return this.userModel.find({ 
      fcm_token: { $ne: null }, // MongoDB query syntax
    }).exec();
  }

}
