import { Injectable } from '@nestjs/common';
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

  // Find User by Email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Find User by ID
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  
}
