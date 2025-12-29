import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCareUserDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsString()
  gender: string;

  @IsString()
  address: string;

  @IsString()
  mainCondition: string;

  @IsString()
  aiSchedule: string;

  @IsString()
  institutionId: string; // 기관에서 등록하므로 필수

  @IsOptional()
  @IsString()
  manager?: string; // 담당 복지사 이름
}
