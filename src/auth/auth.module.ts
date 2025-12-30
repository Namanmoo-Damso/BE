import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Institution } from 'src/entities/institution.entity';
import { JwtStrategy } from '../utils/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Institution]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'damso-secret-key-change-in-production',
      signOptions: { expiresIn: '1h' }, // Access Token 유효기간 1시간
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
