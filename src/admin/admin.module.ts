import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from './admin.schema';


@Module({
    
    imports: [
        MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
      ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {

}