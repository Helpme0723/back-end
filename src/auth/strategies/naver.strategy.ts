import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function
  ) {
    const userEmail = profile._json.email;
    const userNickname = profile.displayName;
    const userProfileImg = profile._json.profile_image;

    let user = await this.authService.findUserByEmail(userEmail);

    if (!user) {
      user = await this.authService.createSocialUser(
        userEmail,
        userNickname,
        userProfileImg,
        'naver'
      );
    }

    if (!user.naver) {
      await this.authService.changeProvider(userEmail, 'naver');
    }

    return done(null, user);
  }
}
