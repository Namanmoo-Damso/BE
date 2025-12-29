// careuser.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateCareUserDto } from './dto/create-dto-user.dto';
import { CareUsersService } from './careuser.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 가드 필요
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('care-users')
@UseGuards(JwtAuthGuard) // 토큰 인증이 필요한 API임을 명시
export class CareUsersController {
  constructor(private readonly careUsersService: CareUsersService) {}

  // 기관용: 대상자 등록 (토큰의 institutionId 사용)
  @Post()
  create(
    @GetUser('institutionId') instId: string, 
    @Body() createCareUserDto: CreateCareUserDto
  ) {
    return this.careUsersService.create(instId, createCareUserDto);
  }

  // 기관용: 본인 기관의 대상자 목록만 조회
  @Get()
  findAllByInstitution(@GetUser('institutionId') instId: string) {
    return this.careUsersService.findAllByInstitution(instId);
  }
}
