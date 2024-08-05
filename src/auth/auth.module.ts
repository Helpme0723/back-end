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

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
