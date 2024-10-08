import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from 'src/configs/cache.config';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { PointHistory } from 'src/point/entities/point-history.entity';
import { NaverStrategy } from './strategies/naver.strategy';
import { UtilsModule } from 'src/utils/utils.module';
import { KakaoStrategy } from './strategies/kakao.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PointHistory]),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),
    PassportModule,
    JwtModule.register({}),
    UtilsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
})
export class AuthModule {}
