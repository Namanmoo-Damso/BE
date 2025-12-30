import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { LivekitService } from './livekit.service';

/**
 * LiveKit 컨트롤러
 * LiveKit 실시간 통신 기능을 위한 API 엔드포인트 제공
 */
@Controller('livekit')
export class LivekitController {
  private readonly logger = new Logger(LivekitController.name);

  constructor(private readonly livekitService: LivekitService) {}

  /**
   * 헬스체크 엔드포인트
   * LiveKit 서비스 상태 확인
   */
  @Get('/healthz')
  getHealth() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  /**
   * RTC 토큰 발급
   * 클라이언트가 LiveKit 방에 접속하기 위한 인증 토큰 생성
   * @param body - 방 이름, 사용자 식별자, 이름, 역할(host/viewer/observer)
   * @returns 토큰 정보 (token, livekitUrl, expiresAt 등)
   */
  @Post('/token')
  async getRtcToken(
    @Body()
    body: {
      roomName?: string;
      identity?: string;
      name?: string;
      role?: 'host' | 'viewer' | 'observer';
    },
  ) {
    // 방 이름 검증
    const roomName = body.roomName?.trim();
    if (!roomName) {
      throw new HttpException('roomName is required', HttpStatus.BAD_REQUEST);
    }

    // 사용자 식별자 검증
    const identity = body.identity?.trim();
    if (!identity) {
      throw new HttpException('identity is required', HttpStatus.BAD_REQUEST);
    }

    // 이름 기본값 설정 (없으면 identity 사용)
    const name = (body.name ?? identity).trim();
    // 역할 기본값 설정 (없으면 viewer)
    const role = body.role ?? 'viewer';

    // 역할 유효성 검증
    if (!['host', 'viewer', 'observer'].includes(role)) {
      throw new HttpException('invalid role', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(
      `getRtcToken room=${roomName} identity=${identity} role=${role}`,
    );

    return await this.livekitService.issueRtcToken({
      roomName,
      identity,
      name,
      role,
    });
  }

  /**
   * 전체 방 목록 조회
   * LiveKit 서버에 생성된 모든 활성 방 목록 반환
   * @returns 방 목록 (name, sid, numParticipants 등)
   */
  @Get('/rooms')
  async listRooms() {
    const rooms = await this.livekitService.listRooms();
    this.logger.log(`listRooms count=${rooms.length}`);
    return { rooms };
  }

  /**
   * 특정 방의 참가자 목록 조회
   * 지정된 방에 현재 접속 중인 참가자 정보 반환
   * @param roomNameParam - 조회할 방 이름
   * @returns 참가자 목록 (identity, name, sid, joinedAt)
   */
  @Get('/rooms/:roomName/members')
  async listRoomMembers(@Param('roomName') roomNameParam: string) {
    const roomName = roomNameParam?.trim();
    if (!roomName) {
      throw new HttpException('roomName is required', HttpStatus.BAD_REQUEST);
    }

    const members = await this.livekitService.listRoomMembers(roomName);
    this.logger.log(`listRoomMembers room=${roomName} count=${members.length}`);
    return { roomName, members };
  }
}
