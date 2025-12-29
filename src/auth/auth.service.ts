import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
      /**
   * 회원가입
   */
    async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // 이메일 중복 체크
    const existingUser = await this.userRepository.findOne({
        where: { email },
    });

    if (existingUser) {
        throw new ConflictException('이미 존재하는 이메일입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
        email,
        password_hash: hashedPassword,
        name,
        auth_type: 'email',
    });

    const savedUser = await this.userRepository.save(user);

    // 비밀번호 제외하고 반환
    const { password_hash, ...result } = savedUser;
    return result;
  }

  /**
   * 로그인
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Access Token 유효기간 1시간
    });

    // Refresh Token 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'damso-refresh-secret-key-change-in-production',
      expiresIn: '7d', // Refresh Token 유효기간 7일
    });

    // Refresh Token 해시화하여 DB에 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // 마지막 로그인 시간 및 Refresh Token 업데이트
    await this.userRepository.update(user.id, {
      last_login_at: new Date(),
      refresh_token: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Refresh Token으로 새로운 Access Token 발급
   */
  async refresh(refreshToken: string) {
    try {
      // Refresh Token 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'damso-refresh-secret-key-change-in-production',
      });

      // 사용자 찾기
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refresh_token) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      }

      // DB에 저장된 해시화된 Refresh Token과 비교
      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refresh_token);

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      }

      // 새로운 Access Token 생성
      const newPayload = { sub: user.id, email: user.email };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않거나 만료된 리프레시 토큰입니다');
    }
  }

  /**
   * 로그아웃 - Refresh Token 무효화
   */
  async logout(userId: string) {
    await this.userRepository.update(userId, {
      refresh_token: null,
    });

    return {
      message: '로그아웃되었습니다',
    };
  }
}
