import { Controller, Post, Get, Body, Param, Put, UseGuards, BadRequestException, Delete, UnauthorizedException, HttpException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.decorator'; // Import the custom interface
import * as bcrypt from 'bcrypt';

import { Twilio } from 'twilio';
import { Otp } from './schemas/otp.schema';


@Controller('auth')

export class AuthController {
    private twilioClient: Twilio;
    constructor(
        private authService: AuthService,
        private userService: UserService,
      ) {
        this.twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      }
    
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
        const NORMAL_LOGIN_LIMIT = 1;
        const CORPORATE_LOGIN_LIMIT = 2;
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
          
          await this.userService.update(user._id.toString(), {login_attempts: user.login_attempts,})

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

      // forget password, 1 request otp
      @Post('request-otp')
      async requestOtp(@Body('phone') phone: string){

        const otpReq = await this.userService.createOtp(phone);

        if (otpReq.success){
          await this.twilioClient.messages.create({
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER,
            body: `Your verification code is: ${otpReq.otp}. This code expires in 3 minutes`
          });

          return {success: true, message: "OTP sent to your phone number."}
        }
        else{
          return {success: false, message: "OTP sent failed."}
        }
      }

      @Post('verify-otp')
      async verifyOtp(
        @Body('otp') otp: string,
        @Body('phone') phone: string
      )
      {
        const isValid = await this.userService.validateOtp(otp, phone);

        if (!isValid){
          throw new BadRequestException('Cannot verify the OTP')
        }

        return{
          success: true,
          message: "Otp verified"
        }

      }

      @Put('reset-password')
      @UseGuards(AuthGuard('jwt'))
      async resetPassword(@User() user: any, @Body('password') password: string){
        const userId = user._id;

        try {
          const update_data =  await this.userService.updateUser(userId.toString(), {password: password})

          return {success: true, update_data}
 
        } catch (error) {
          throw new BadRequestException('Cannot change the password')
          
        }

      }

      // block/unblock user
      @Post('unblock/:id')
      async unblockUser(@Param('id') userId: string){
        return this.authService.unblockUser(userId);
      }

      @Post('block/:id')
      async blockUser(@Param('id') userId: string){
        return this.authService.blockUser(userId);
      }

      

}
