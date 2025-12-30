// careuser.controller.ts
import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { CreateCareUserDto } from './dto/create-dto-user.dto';
import { CareUsersService } from './careuser.service';
import { GetUser } from '../auth/get-user.decorator';

// 로그인 미구현 구간: 기관 번호 임시 하드코드 (향후 JWT 가드 활성화 후 삭제 예정)
const FALLBACK_INSTITUTION_ID = process.env.DEV_INSTITUTION_ID || 'INST-003';

@Controller('care-users')
export class CareUsersController {
  constructor(private readonly careUsersService: CareUsersService) {}

  // 기관용: 대상자 등록 (토큰의 institutionId 사용)
  @Post()
  create(
    @Headers('x-institution-id') headerInstId: string,
    @GetUser('institutionId') instId: string,
    @Body() createCareUserDto: CreateCareUserDto
  ) {
    const institutionId = instId || headerInstId || FALLBACK_INSTITUTION_ID;
    return this.careUsersService.create(institutionId, createCareUserDto);
  }

  // 기관용: 본인 기관의 대상자 목록만 조회
  @Get()
  findAllByInstitution(
    @Headers('x-institution-id') headerInstId: string,
    @GetUser('institutionId') instId: string
  ) {
    const institutionId = instId || headerInstId || FALLBACK_INSTITUTION_ID;
    return this.careUsersService.findAllByInstitution(institutionId);
  }

  // 기관용: CSV 단체 등록 (하드코드 기관번호 허용)
  @Post('bulk')
  createBulk(
    @Headers('x-institution-id') headerInstId: string,
    @GetUser('institutionId') instId: string,
    @Body() dtos: CreateCareUserDto[],
  ) {
    const institutionId = instId || headerInstId || FALLBACK_INSTITUTION_ID;
    return this.careUsersService.createBulk(institutionId, dtos);
  }
}
