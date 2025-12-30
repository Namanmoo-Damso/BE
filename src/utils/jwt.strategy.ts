import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { ConfigService } from '@nestjs/config';

/**
 * JWT 인증 전략
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // JWT 서명 키는 환경변수에서만 읽어오도록 유지
      secretOrKey: jwtSecret,
    });
  }

  /**
   * JWT 페이로드 검증 후 사용자 정보 반환
   */
  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }

    return {
      id: user.id,
      email: user.email,
      institutionId: user.institution_id,
    };
  }
}
