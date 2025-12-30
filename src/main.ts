import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 환경변수 확인
  const requiredEnvVars = [
    'PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'DB_HOST',
    'DB_PORT',
    'JWT_ACCESS_EXPIRATION',
    'JWT_REFRESH_EXPIRATION',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`필수 환경변수 ${envVar}가 없습니다.`);
      process.exit(1);
    }
  }
  // CORS 설정 - 프론트엔드에서 API 호출 허용
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  const allowedOrigins =
    corsOrigin === '*'
      ? '*'
      : corsOrigin.split(',').map(origin => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: process.env.CORS_CREDENTIALS === 'true', // 쿠키 등 인증 정보 허용
  });

  // NestJS 서버가 받는 모든 요청의 기본 path
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 8080); // docker-compose.yml에서 PORT 환경변수 주입
}
bootstrap();
