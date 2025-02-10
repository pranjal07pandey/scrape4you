import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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

  // Find User by Email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Find User by ID
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  
}
