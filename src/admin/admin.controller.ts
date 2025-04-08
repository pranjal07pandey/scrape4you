import { Controller, Post, Body, UnauthorizedException, } from '@nestjs/common';
import { AdminService } from './admin.service';
import * as bcrypt from 'bcrypt';


@Controller('admin')
export class AdminController{
    constructor(
        private adminService: AdminService
    ) {}

    @Post('register')
    async register(@Body() body: any){
        const {email, password} = body;

        const admin = await this.adminService.registerAdmin(email, password);
        return {message: "Registration Successful", admin};
        
    }

    @Post('login')
    async login(@Body() body: any){
        const {email, password} = body;

        const admin = await this.adminService.findAdmin(email);
        if (!admin) throw new UnauthorizedException('Invalid Email or password');

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid) throw new UnauthorizedException('Invalid Email or password');
        
        return {
            message: "Login Successful",
            admin: {email: admin.email, id: admin._id}
        }

    }
}