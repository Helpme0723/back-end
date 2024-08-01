import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }
  // body로 들어온 email, password 값 검증
  async validate(email: string, password: string) {
    // user = { id: user.id }
    const userId = await this.authService.validateUser({ email, password });

    // 예외 처리
    if (!userId) {
      throw new UnauthorizedException('일치하는 인증 정보가 없습니다.');
    }

    return userId;
  }
}
