import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CarDetails } from 'src/car-details.schema';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CarDetails.name) private carModel: Model<CarDetails>

  ) {}

  async create(userData: any): Promise<User> {
    const { password, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      ...rest,
      password: hashedPassword,
      date_created: new Date(),
      date_updated: new Date(),
    });

    return user.save();
  }

  async updateUser(userId: string, updateData: any): Promise<User> {
    // Extract the password field (if it exists)
  const { password, ...rest } = updateData;

    // If the password is provided, hash it before updating
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    } else {
      // If the password is not provided, remove it from the update data
      delete updateData.password;
    }

    // Add the current date to `date_updated`
    updateData.date_updated = new Date();

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true }) // `new: true` returns the updated document
      .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
  
      return updatedUser;

  }

  //update subscription
  async updateSubs(userId: string, updateData: Partial<User>): Promise<User> {
    // Ensure password is not accidentally updated
      if ('password' in updateData) {
        delete updateData.password;
    }
    // Automatically update `date_updated`
    updateData.date_updated = new Date();

    const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { $set: updateData }, { new: true }) // `$set` ensures only the provided fields are updated
        .exec();

    if (!updatedUser) {
        throw new NotFoundException('User not found');
    }

    return updatedUser;

  }

  // Find User by Email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Find User by ID
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  //get all favorite cars
  async getFavorites(userId: string){
    const user = await this.userModel.findById(userId).populate({
      path: 'favorites',
      model: 'CarDetails'});
    if (!user) throw new NotFoundException('User not found');
    return user.favorites;
  }

  //toggle favorites
  async toggleFavorite(userId: string, carId: string){
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found!')

    const car = await this.carModel.findById(carId);
    if (!car) throw new NotFoundException('Car not found!')

    
    const carObject = new Types.ObjectId(carId);
    
    const index = user.favorites.findIndex(fav => fav.equals(carObject));
    if (index === -1) {
      user.favorites.push(carObject);  // Add to favorites
    } else {
      user.favorites.splice(index, 1);  // Remove from favorites
    }
    await user.save();
    return { message: 'Favorite list updated', favorites: user.favorites };
  }


  
}
