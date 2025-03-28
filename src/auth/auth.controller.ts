import { Controller, Post, Get, Body, Req, Patch, Param, HttpStatus, HttpException, Put, UseGuards, BadRequestException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.decorator'; // Import the custom interface
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
      ) {}
    
      @Post('register')
      async register(@Body() body: any) {
        const user = await this.authService.register(body);
        return {"message": "Registration Successful", user};
      }

      @Post('login')
      async login(@Body() body: any) {
        const {email, password, deviceId} = body;

        if (!deviceId){
          throw new BadRequestException('Device Id is required')
        }
        
        const user = await this.authService.login(email, password, deviceId);
        return user;
      }

      @Get('get-user-details')
      @UseGuards(AuthGuard('jwt'))
      async getProfile(@User() user: any){
        // return userId;
        return{
          userId: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone,
          profile_image: user.profile_image,
          is_subscribed: user.is_subscribed,
          active_devices: user.active_devices
        }

      }

      @Put('update-user-profile')
      @UseGuards(AuthGuard('jwt'))
      async updateProfile(@User() user: any, @Body() body: any){
        const userId = user._id;
        const updatedUser = await this.userService.updateUser(userId, body);
        return{
          message: 'Profile updated successfully',
          user:{
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            phone_number: updatedUser.phone,
            profile_image: updatedUser.profile_image
          }
        }
      }

      @Put('update-subscription')
      @UseGuards(AuthGuard('jwt'))
      async updateSubscription(@User() user:any,  @Body() body: any){
        const subscriptionType = body.subscription; 
        const userId = user._id;

        if (!subscriptionType) {
          throw new BadRequestException('Subscription type is required');
      }

        const updatedUser = await this.userService.updateSubs(userId, { is_subscribed: subscriptionType });

        return{
          message: 'Subscription added successfully',
          subscriptionType: updatedUser.is_subscribed
        }
      }


      @Post('add-to-saved/:carId')
      @UseGuards(AuthGuard('jwt'))
      async toggleFavorite(@User() user:any, @Param("carId") carId: string){
        const userId = user._id;
        return this.userService.toggleFavorite(userId, carId);

      }

      @Get('list-all-saved')
      @UseGuards(AuthGuard('jwt'))
      async getFavorites(@User() user: any){
        const userId = user._id;
        return this.userService.getFavorites(userId);
      }

}
