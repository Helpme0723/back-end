import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');

  app.setGlobalPrefix('api', { exclude: ['/health-check'] });
  app.useGlobalPipes(
    new ValidationPipe({
      // 요청 데이터를 DTO(Data Transfer Object) 클래스로 자동 변환
      transform: true,
      // DTO 클래스에 정의된 속성만 요청 데이터에 남기고, 나머지 속성은 제거
      whitelist: true,
      // DTO 클래스에 정의되지 않은 속성이 요청 데이터에 포함된 경우, 유효성 검사에서 에러를 발생
      forbidNonWhitelisted: true,
    })
  );

  // CORS 설정 추가
  app.enableCors({
    origin: [configService.get<string>('PRODUCTION_URL'),configService.get<string>('DEVELOP_URL')],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('TalentVerse')
    .setDescription('TalentVerse PROJECT')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }) // JWT 사용을 위한 설정
    // .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침 시에도 JWT 유지하기
      tagsSorter: 'alpha', // API 그룹 정렬을 알파벳 순으로
      operationsSorter: 'alpha', // API 그룹 내 정렬을 알파벳 순으로
    },
  });

  await app.listen(port);
}
bootstrap();
