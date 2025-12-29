import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 등록 유형 정의
export enum RegistrationType {
  INSTITUTION = 'INSTITUTION', // 복지관 등 기관 등록
  PRIVATE = 'PRIVATE',         // 자녀 등 개인이 직접 등록
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

@Entity('care_users')
export class CareUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ type: 'varchar', length: 10 })
  gender: string;

  @Column()
  address: string;

  @Column({
    type: 'enum',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'LOW',
  })
  riskLevel: RiskLevel;

  @Column({ type: 'text' })
  mainCondition: string;

  @Column()
  aiSchedule: string;

  @Column({ type: 'text', nullable: true })
  lastAiReport: string;

  // --- 관계 및 식별자 설정 ---

  @Column({
    type: 'enum',
    enum: RegistrationType,
    default: RegistrationType.INSTITUTION,
  })
  regType: RegistrationType;

  // 기관 소속일 경우 (기관 관리자용)
  @Column({ nullable: true })
  institutionId: string;

  // 개인 등록일 경우 (자녀/보호자 ID)
  @Column({ nullable: true })
  guardianId: string;

  // 기존 'manager'는 기관 소속일 때만 의미가 있으므로 nullable 처리하거나 
  // 개인 등록 시엔 '보호자 성함' 등으로 활용 가능
  @Column({ nullable: true })
  manager: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}