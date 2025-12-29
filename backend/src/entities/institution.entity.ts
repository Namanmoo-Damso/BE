import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * 기관에 대한 정보
 **/
@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string; // 기관 고유 ID

  @Column()
  name: string; // 기관 이름

  @Column()
  address: string; // 기관 주소

  @CreateDateColumn()
  created_at: Date; // 생성 일시
}