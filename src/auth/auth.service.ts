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
  async login(email: string, password: string): Promise<{ access_token: string; message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Email or password');
    }

    const payload = { sub: user._id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { access_token, message: "Login successful" };

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
