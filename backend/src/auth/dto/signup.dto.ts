/**
 * 회원가입을 위한 입력 데이터
 */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string; // 이메일 주소

  @IsString()
  @MinLength(8)
  password: string; // 비밀번호 (최소 8자)

  @IsString()
  name: string; // 직원 이름
}