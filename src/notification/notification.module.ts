// src/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettings } from './entities/notification-settings.entity';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSettings, Notification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'), // 환경 변수에서 JWT 비밀키를 가져옵니다.
        signOptions: { expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRES') }, // 토큰 유효 기간 설정
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
