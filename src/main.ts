import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 - 프론트엔드에서 API 호출 허용
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? [
          'https://1.sodam.store',
          'https://2.sodam.store',
          'https://3.sodam.store',
          'https://4.sodam.store',
          'https://5.sodam.store',
        ]
      : '*', // 개발용: 모든 origin 허용
    credentials: true, // 쿠키 등 인증 정보 허용
  });

  // NestJS 서버가 받는 모든 요청의 기본 path
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000); // docker-compose.yml에서 PORT 환경변수 주입
}
bootstrap();
