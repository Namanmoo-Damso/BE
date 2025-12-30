// careuser.controller.ts
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCareUserDto } from './dto/create-dto-user.dto';
import { CareUsersService } from './careuser.service';
import { GetUser } from '../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('care-users')
@UseGuards(AuthGuard('jwt'))
export class CareUsersController {
  constructor(private readonly careUsersService: CareUsersService) {}

  // 기관용: 대상자 등록 (토큰의 institutionId 사용)
  @Post()
  create(
    @GetUser('institutionId') institutionId: string,
    @Body() createCareUserDto: CreateCareUserDto,
  ) {
    return this.careUsersService.create(institutionId, createCareUserDto);
  }

  // 기관용: 본인 기관의 대상자 목록만 조회
  @Get()
  findAllByInstitution(@GetUser('institutionId') institutionId: string) {
    return this.careUsersService.findAllByInstitution(institutionId);
  }

  // 기관용: CSV 단체 등록 (하드코드 기관번호 허용)
  @Post('bulk')
  createBulk(
    @GetUser('institutionId') institutionId: string,
    @Body() dtos: CreateCareUserDto[],
  ) {
    return this.careUsersService.createBulk(institutionId, dtos);
  }
}
