import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // DataSource 추가
import { CareUserEntity, RegistrationType } from './entities/careuser.entity';
import { CreateCareUserDto } from './dto/create-dto-user.dto';

@Injectable()
export class CareUsersService {
  constructor(
    @InjectRepository(CareUserEntity)
    private readonly userRepository: Repository<CareUserEntity>,
    // 트랜잭션을 위해 DataSource 주입
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 1. 개별 대상자 등록
   */
  async create(
    instId: string,
    dto: CreateCareUserDto,
  ): Promise<CareUserEntity> {
    const newUser = this.userRepository.create({
      ...dto,
      institutionId: instId,
      regType: RegistrationType.INSTITUTION,
    });
    return await this.userRepository.save(newUser);
  }

  /**
   * 2. CSV 단체 대상자 등록 (Bulk Create)
   * 트랜잭션을 적용하여 전체 성공 혹은 전체 실패(Rollback)를 보장합니다.
   */
  async createBulk(instId: string, dtos: CreateCareUserDto[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // DTO 배열을 엔티티 객체 배열로 변환
      const users = dtos.map(dto =>
        this.userRepository.create({
          ...dto,
          institutionId: instId,
          regType: RegistrationType.INSTITUTION,
        }),
      );

      // 대량 데이터 저장
      await queryRunner.manager.save(CareUserEntity, users);

      // 모든 작업 성공 시 커밋
      await queryRunner.commitTransaction();
    } catch (err) {
      // 에러 발생 시 진행했던 모든 저장 작업 취소 (Rollback)
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        '단체 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
      );
    } finally {
      // 사용한 queryRunner 해제
      await queryRunner.release();
    }
  }

  /**
   * 3. 기관별 대상자 목록 조회
   */
  async findAllByInstitution(instId: string): Promise<CareUserEntity[]> {
    return await this.userRepository.find({
      where: { institutionId: instId },
      order: { createdAt: 'DESC' },
    });
  }
}
