import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');

  app.setGlobalPrefix('api', { exclude: ['/health-check'] });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS 설정 추가
  app.enableCors({
    origin: '*', // 모든 출처 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 허용할 HTTP 메서드
    credentials: true, // 자격 증명 허용
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('TalentVerse')
    .setDescription('TalentVerse PROJECT')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // 정적 파일 서빙 설정
  app.useStaticAssets(join(__dirname, '..', 'build'));
  app.setBaseViewsDir(join(__dirname, '..', 'build'));
  app.setViewEngine('html');

  // 모든 경로를 React 애플리케이션의 index.html로 리디렉션
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/api-docs')) {
      return next();
    }
    res.sendFile(join(__dirname, '..', 'build', 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
