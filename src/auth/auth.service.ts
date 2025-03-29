import { Injectable, UnauthorizedException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // User Registration
  async register(userData: any): Promise<User> {
    if (!userData.password) {
        throw new UnauthorizedException('Password is required');
      }

    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
    return this.userService.create(userData);
  }

  // Login
  async login(email: string, password: string, deviceId: string): Promise<{ access_token: string; message: string, active_devices:Object}> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Email or password');
    }

    // Check subscription type and enforce device limits
    if (user.is_subscribed === 'scrap' || user.is_subscribed === 'salvage' || user.is_subscribed === 'None'){
      // Only 1 device allowed, remove previous one
      user.active_devices = [deviceId];

    }else if (user.is_subscribed === 'corporate'){
      // Allow up to 2 devices, remove the oldest if exceeding
      if (!user.active_devices.includes(deviceId)) {
        if (user.active_devices.length >= 2) {
            user.active_devices.shift(); // Remove the oldest device
        }
        user.active_devices.push(deviceId);
      }
    }

    // Save updated user data
    await this.userService.updateUser(user._id.toString(), { active_devices: user.active_devices });

    const payload = { sub: user._id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {message: "Login successful", access_token, active_devices: user.active_devices };


  }

  // Validate User for JWT Strategy
  async validateUser(userId: string): Promise<any> {
    const user =  this.userService.findById(userId);
    if (!user){
      return null;
    }
    return user;
  }


}
