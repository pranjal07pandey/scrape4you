import { Injectable, UnauthorizedException, HttpException  } from '@nestjs/common';
import { Admin } from './admin.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AdminService{
    constructor(
        @InjectModel('Admin') private adminModel: Model<Admin>
    ){}

    async registerAdmin(email:string, password:string){
        if (!password){
            throw new UnauthorizedException('Password is required')
        }
        const existingAdmin = await this.adminModel.findOne({email}).exec();

        console.log('Existing Admin--->', existingAdmin);
        if (existingAdmin){
            throw new UnauthorizedException('Email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.adminModel({email:email, password: hashedPassword})

        return user.save()
    }

    async findAdmin(email:string){
        return this.adminModel.findOne({email}).exec();
    }
}