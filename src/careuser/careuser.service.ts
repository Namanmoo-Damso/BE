import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareUserEntity, RegistrationType } from './entities/careuser.entity';
import { CreateCareUserDto } from './dto/create-dto-user.dto';

@Injectable()
export class CareUsersService {
  constructor(
    @InjectRepository(CareUserEntity)
    private readonly userRepository: Repository<CareUserEntity>,
  ) {}

  // instId를 매개변수로 추가
  async create(instId: string, dto: CreateCareUserDto): Promise<CareUserEntity> {
    const newUser = this.userRepository.create({
      ...dto,
      institutionId: instId, // 토큰에서 온 ID 저장
      regType: RegistrationType.INSTITUTION,
    });
    return await this.userRepository.save(newUser);
  }

  async findAllByInstitution(instId: string): Promise<CareUserEntity[]> {
    return await this.userRepository.find({
      where: { institutionId: instId }, // 본인 기관 데이터만 필터링
      order: { createdAt: 'DESC' },
    });
  }
}