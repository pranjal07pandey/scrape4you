import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from './user.module';  // Import UserModule
import { ConfigModule } from '@nestjs/config';
import { S3Service } from 'src/car-info/upload-image';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '90d' },
    }),
    UserModule,  // Import the UserModule to make UserService available
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy, S3Service],

  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
