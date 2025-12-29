import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NestJS 서버가 받는 모든 요청의 기본 path
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000); // docker-compose.yml에서 PORT 환경변수 주입
}
bootstrap();
