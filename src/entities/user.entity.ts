import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * 기관 직원 / 개인 보호자 정보
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // 사용자 고유 ID

  @Column({nullable:true})
  institution_id: string; // 소속 기관 ID

  @Column({ default: 'email' })
  auth_type: string; // 인증 타입 (email, google, kakao 등)

  @Column({ unique: true })
  email: string; // 이메일 주소

  @Column({ nullable: true })
  password_hash: string; // 비밀번호 해시

  @Column({ nullable: true })
  oauth_provider: string; // OAuth 제공자 (google, kakao 등)

  @Column({ nullable: true })
  oauth_id: string; // OAuth 사용자 ID

  @Column()
  name: string; // 사용자 이름

  @Column({ nullable: true })
  profile_image_url: string; // 프로필 이미지 URL

  @CreateDateColumn()
  created_at: Date; // 생성 일시

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date; // 마지막 로그인 일시

  @Column({ nullable: true })
  refresh_token: string; // Refresh Token (해시값 저장)

  @Column({ nullable: true })
  elder_email: string; // 피보호자 이메일
}