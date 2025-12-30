import { Injectable, Logger } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

// 사용자 역할 타입
type Role = 'host' | 'viewer' | 'observer';

// RTC 토큰 발급 결과 타입
type RtcTokenResult = {
  livekitUrl: string; // LiveKit 서버 URL
  roomName: string; // 방 이름
  token: string; // 접속 토큰
  expiresAt: string; // 만료 시간
  identity: string; // 사용자 식별자
  name: string; // 사용자 이름
  role: Role; // 사용자 역할
};

/**
 * LiveKit 서비스
 * LiveKit 실시간 통신 기능 제공 (토큰 발급, 방 관리, 참가자 관리)
 */
@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly livekitUrl: string; // 클라이언트 접속용 WebSocket URL
  private readonly livekitApiKey: string; // API 키
  private readonly livekitApiSecret: string; // API 시크릿
  private readonly tokenTtlSeconds: number; // 토큰 유효 시간 (초)
  private roomService: RoomServiceClient; // LiveKit 서버 API 클라이언트

  constructor(private configService: ConfigService) {
    // 환경변수에서 LiveKit 설정 로드
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';
    this.livekitApiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.livekitApiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.tokenTtlSeconds = parseInt(
      this.configService.get<string>('LIVEKIT_TOKEN_TTL') || '600',
      10,
    );

    if (!this.livekitUrl || !this.livekitApiKey || !this.livekitApiSecret) {
      this.logger.warn('LiveKit credentials not configured');
    }

    // RoomServiceClient용 HTTP API URL 사용 (없으면 WebSocket URL로 대체)
    const livekitApiUrl = this.configService.get<string>('LIVEKIT_API_URL') || this.livekitUrl;
    this.roomService = new RoomServiceClient(
      livekitApiUrl,
      this.livekitApiKey,
      this.livekitApiSecret,
    );
  }

  /**
   * RTC 토큰 발급
   * 클라이언트가 LiveKit 방에 접속하기 위한 JWT 토큰 생성
   * @param params - 방 이름, 사용자 식별자, 이름, 역할
   * @returns 토큰 및 접속 정보
   */
  async issueRtcToken(params: {
    roomName: string;
    identity: string;
    name: string;
    role: Role;
  }): Promise<RtcTokenResult> {
    const ttlSeconds = this.tokenTtlSeconds;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    this.logger.log(
      `issueRtcToken room=${params.roomName} identity=${params.identity} role=${params.role}`,
    );

    // AccessToken 생성 (사용자 정보 포함)
    const accessToken = new AccessToken(
      this.livekitApiKey,
      this.livekitApiSecret,
      {
        identity: params.identity,
        name: params.name,
        ttl: ttlSeconds,
      },
    );

    // 권한 부여 (역할에 따라 다른 권한 설정)
    accessToken.addGrant({
      roomJoin: true, // 방 입장 권한
      room: params.roomName, // 입장 가능한 방
      canPublish: params.role !== 'observer', // 미디어 발행 권한 (observer는 불가)
      canSubscribe: true, // 다른 사용자 미디어 수신 권한
      canPublishData: params.role !== 'observer', // 데이터 메시지 발행 권한
      roomAdmin: params.role === 'host', // 방 관리자 권한 (host만)
    });

    return {
      livekitUrl: this.livekitUrl,
      roomName: params.roomName,
      token: await accessToken.toJwt(),
      expiresAt,
      identity: params.identity,
      name: params.name,
      role: params.role,
    };
  }

  /**
   * 특정 방의 참가자 목록 조회
   * @param roomName - 방 이름
   * @returns 참가자 정보 배열
   */
  async listRoomMembers(roomName: string) {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants.map((p) => ({
        identity: p.identity,
        name: p.name,
        sid: p.sid,
        joinedAt: p.joinedAt,
      }));
    } catch (error) {
      this.logger.warn(`Failed to list room members: ${error}`);
      return [];
    }
  }

  /**
   * 전체 방 목록 조회
   * LiveKit 서버의 모든 활성 방 정보 반환
   * @returns 방 정보 배열
   */
  async listRooms() {
    try {
      const rooms = await this.roomService.listRooms();
      return rooms.map((room) => ({
        name: room.name,
        sid: room.sid,
        numParticipants: room.numParticipants,
        creationTime: room.creationTime ? Number(room.creationTime) : 0, // BigInt를 Number로 변환
        emptyTimeout: room.emptyTimeout ? Number(room.emptyTimeout) : 0, // BigInt를 Number로 변환
        maxParticipants: room.maxParticipants,
      }));
    } catch (error) {
      this.logger.warn(`Failed to list rooms: ${error}`);
      return [];
    }
  }
}
