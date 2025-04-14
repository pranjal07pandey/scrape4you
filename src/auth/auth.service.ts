import { Injectable, UnauthorizedException, HttpException  } from '@nestjs/common';
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

    const isCorporate = ['Corporate Salvage', 'Corporate Scrap'].includes(user.is_subscribed);
    const deviceLimit = isCorporate ? 2 : 1;

    // user.login_attempts = user.login_attempts.filter(
    //   attempt => now.getTime() - attempt.timestamp.getTime() <= cooldownWindow
    // );

    // Check if the user has hit the login limit
    // const loginLimit = isCorporate ? CORPORATE_LOGIN_LIMIT : NORMAL_LOGIN_LIMIT;

    // if (!user.active_devices.includes(deviceId)){
    //   if (user.login_attempts.length >= loginLimit) {
    //     throw new HttpException(
    //       `Too many login attempts. Wait ${COOLDOWN_MINUTES} minutes before trying again.`,
    //       429, // 429 = Too Many Requests
    //     );
    //   }

    // }

    // // Allow the login and record the attempt
    // user.login_attempts.push({ timestamp: now, deviceId });

    // Device Management
    if (!user.active_devices.includes(deviceId)){
      if (user.active_devices.length >= deviceLimit){
        if (isCorporate){
          // For corporate, only remove the oldest device, FIFO
          user.active_devices.shift() // removes first element
          user.active_devices.push(deviceId); //Add new device at end
        }
        else{
          //For normal accounts, replace all existing devices
          user.active_devices = [deviceId];
        }
      }
      else{
        // Under limit - just add new device
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
