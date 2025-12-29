import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 인증 가드
 * 로그인한 사용자만 접근 가능한 엔드포인트를 보호할 때 사용
 *
 * 사용 예시:
 *
 * // 1. 단일 엔드포인트에 적용
 * @Controller('users')
 * export class UsersController {
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@Request() req) {
 *     return req.user; // JWT에서 추출한 사용자 정보
 *   }
 * }
 *
 * // 2. 컨트롤러 전체에 적용
 * @UseGuards(JwtAuthGuard)
 * @Controller('admin')
 * export class AdminController {
 *   // 이 컨트롤러의 모든 엔드포인트가 보호됨
 * }
 *
 * Authorization 헤더 형식:
 * Authorization: Bearer <access_token>
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}