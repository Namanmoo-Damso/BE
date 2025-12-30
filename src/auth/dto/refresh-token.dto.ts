/**
 * 리프레시 토큰을 위한 입력 데이터
 */
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string; // 리프레시 토큰
}
