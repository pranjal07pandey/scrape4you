import { Controller, Post, Get, Body, BadRequestException, Patch, Param, HttpStatus, HttpException, Put, Delete} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

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
        const user = await this.authService.login(body.email, body.password);
        return user;
      }
}
