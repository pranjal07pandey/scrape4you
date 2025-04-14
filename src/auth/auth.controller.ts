import { Controller, Post, Get, Body, Param, Put, UseGuards, BadRequestException, Delete, UnauthorizedException, HttpException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.decorator'; // Import the custom interface
import * as bcrypt from 'bcrypt';

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

      @Post('attemptLogin')
      async attemptLogin(@Body() body: { email: string, password: string, deviceId: string}){
        const {email, password, deviceId} = body;

        const user = await this.userService.findByEmail(email);

        if (!user){
          throw new UnauthorizedException('Invalid Email or password')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid Email or password');
        }

        const isCorporate = ['Corporate Salvage', 'Corporate Scrap'].includes(user.is_subscribed);
        const deviceLimit = isCorporate ? 2 : 1;

        const now = new Date();
        const COOLDOWN_MINUTES = 1;
        const NORMAL_LOGIN_LIMIT = 2;
        const CORPORATE_LOGIN_LIMIT = 3;
        const cooldownWindow = COOLDOWN_MINUTES * 60 * 1000;

        user.login_attempts = user.login_attempts.filter(
              attempt => now.getTime() - attempt.timestamp.getTime() <= cooldownWindow
            );
        
            // Check if the user has hit the login limit
            const loginLimit = isCorporate ? CORPORATE_LOGIN_LIMIT : NORMAL_LOGIN_LIMIT;
        
            if (!user.active_devices.includes(deviceId)){
              if (user.login_attempts.length >= loginLimit) {
                throw new HttpException(
                  `Too many login attempts. Wait ${COOLDOWN_MINUTES} minutes before trying again.`,
                  429, // 429 = Too Many Requests
                );
              }
        
            }

          // Allow the login and record the attempt
          user.login_attempts.push({ timestamp: now, deviceId });

        if (user.active_devices.includes(deviceId)) {
          // Device is already registered, no confirmation needed
          return { requires_confirmation: false };
        }

        if (user.active_devices.length >= deviceLimit) {
          // Needs confirmation to force logout others
          return {
            requires_confirmation: true,
            message: isCorporate 
              ? 'There are already 2 devices logged in. Continue will log out your oldest device.'
              : 'There is already a device logged in. Continue will log it out.'
          };
        }

        // No confirmation needed
        return { requires_confirmation: false };
        
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

      @Get('list-all-agents')
      async listAgents(){
        return this.userService.getAllAgents();
      }

      @Delete('delete-agent/:userId')
      async deleteAgent(@Param('userId') userId:string){
        return this.userService.deleteAgentById(userId);
      }
      

}
