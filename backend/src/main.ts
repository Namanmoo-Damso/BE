import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DTO 검증을 위한 전역 ValidationPipe 설정
  // class-validator 데코레이터(@IsEmail, @MinLength 등)를 사용한 자동 검증 활성화
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
