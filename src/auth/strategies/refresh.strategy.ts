import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh'
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.headers.authorization.split(' ')[1];
    const userId = await this.authService.findRefreshTokenById(payload.id);

    return { id: userId, refreshToken };
  }
}
