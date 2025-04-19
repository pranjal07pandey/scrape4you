import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { Otp } from './schemas/otp.schema';
import { CarDetails } from 'src/car-details.schema';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CarDetails.name) private carModel: Model<CarDetails>,
    @InjectModel(Otp.name) private otpModel: Model<Otp>, // If using Mongoose

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

  // Find User by Email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // find User by Phone Number
  async findByNumber(phone: string): Promise<User | null> {
    return this.userModel.findOne({ phone }).exec();
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

  // get all users
  async getAllAgents(){
    const agents = await this.userModel.find();

    if (!agents) throw new NotFoundException('No agents found..')
    
    return agents;

  }

  // delete an agent
  async deleteAgentById(userId: string): Promise<{message: string}>{
    const result = await this.userModel.deleteOne({ _id: userId }).exec();
    if (result.deletedCount ===0){
      throw new NotFoundException('User not found')
    }

    return {message: `User with id ${userId} deleted successfully.`}

  }

  // webhooks changes
  async findByStripeCustomerId(customerId: string) {
    return this.userModel.findOne({ stripeCustomerId: customerId }).exec();
  }

  async update(
    userId: string, 
    updateData: Partial<User> // Accepts partial user object
  ): Promise<User> {
    try {
      return await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true } // Return the updated document
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }


  //update subscription
  async updateSubs(userId: string, updateData: {
    is_subscribed: string;
    subscriptionId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: Date;
    subscriptionEndedAt?: Date;
  }): Promise<User> {
    return this.update(userId, updateData);
  }


  async createOtp(phone: string): Promise<{ success: boolean, otp: string, phone: string }> {
  

      console.log('Clean phone: ', phone);

    
      // Check if user exists (without revealing)
      const user = await this.userModel.findOne({ phone: phone });
      if (!user) return {success: false, otp: "", phone: phone}

      // Delete any existing OTPs for this number
      await this.otpModel.deleteMany({ phone: phone });
  
      // Generate OTP (6 digits)
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes
  
      // Create new OTP document - MongoDB ensures atomic creation
      await this.otpModel.create({
        phone: phone,
        code: hashedOtp,
        expiresAt,
      });
  
      return {
          success: true, 
          otp: rawOtp,
          phone: phone
      }
    }

  async validateOtp(otp: string, phone:string): Promise<boolean> {

    try {
      // Find all active OTPs for this phone
      const otpRecord = await this.otpModel.find({
        phone: phone,
        used: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 }); // Get most recent first

      console.log('OTP record--->', otpRecord);
      if(otpRecord.length == 0){
        return false;
      }

      // Compare the provided OTP
      const isValid = await bcrypt.compare(otp, otpRecord[0].code);

      if (isValid){
        // Mark as read
        await this.otpModel.updateOne(
          {_id: otpRecord[0]._id},
          { $set : {used: true}}
        );
        return true
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }
      
  }
  
    async getActiveOtps(phone: string): Promise<Otp[]> {
      return this.otpModel.find({
        phone,
        used: false,
        expiresAt: { $gt: new Date() }
      });
    }
    
  
}
