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

    const existingUserByEmail = await this.userService.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    const existingUserByPhone = await this.userService.findByNumber(userData.phone);
    if (existingUserByPhone){
      throw new UnauthorizedException('Phone Number already exists');
    }

    return this.userService.create(userData);
  }

  // Login
  async login(email: string, password: string, deviceId: string, fcm_token: string): Promise<{ access_token: string; message: string, active_devices:Object}> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Email or password');
    }

    // check  if user is permanently blocked
    if (user.is_blocked){
      throw new UnauthorizedException('Your account is blocked. Please contact admin to unblock your account.')
    }

    const isCorporate = ['Corporate Salvage', 'Corporate Scrap'].includes(user.is_subscribed);
    const deviceLimit = isCorporate ? 2 : 1;

    

    // comment starts here
    // Device Management
    // if (!user.active_devices.includes(deviceId)){
    //   if (user.active_devices.length >= deviceLimit){
    //     if (isCorporate){
    //       // For corporate, only remove the oldest device, FIFO
    //       user.active_devices.shift() // removes first element
    //       user.active_devices.push(deviceId); //Add new device at end
    //     }
    //     else{
    //       //For normal accounts, replace all existing devices
    //       user.active_devices = [deviceId];
    //     }
    //   }
    //   else{
    //     // Under limit - just add new device
    //     user.active_devices.push(deviceId);
    //   }
    // }

    // comment ends here

    // Save updated user data
    await this.userService.updateUser(user._id.toString(), { active_devices: user.active_devices, fcm_token: fcm_token });

    const payload = { sub: user._id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {message: "Login successful", access_token, active_devices: user.active_devices };

  }

  // guest login
  async guestLogin(deviceId: string, fcm_token: string): Promise<{ access_token: string; message: string, active_devices: Object }> {
    // Create a new guest user
    const guestUser = await this.userService.createGuestUser(deviceId);
    
    // Since it's a new guest, active_devices will be empty
    const active_devices = [deviceId];
    
    // Update user with device info
    await this.userService.updateUser(guestUser._id.toString(), { 
      active_devices, 
      fcm_token 
    });

    // Generate JWT token
    const payload = { sub: guestUser._id, email: guestUser.email };
    const access_token = this.jwtService.sign(payload);

    return {
      message: "Guest login successful", 
      access_token, 
      active_devices
    };
}

  // Validate User for JWT Strategy
  async validateUser(userId: string): Promise<any> {
    const user =  this.userService.findById(userId);
    if (!user){
      return null;
    }
    return user;
  }

  // unblock the user
  async unblockUser(userId: string): Promise<User> {
    return await this.userService.update(
      userId,
      {
        is_blocked: false,
        unblock_message: '',
        login_violations: 0
      },
    );
  }

  // block the user
  async blockUser(userId: string): Promise<User> {
    return await this.userService.update(
      userId,
      {
        is_blocked: true
      },
    );
  }


}
