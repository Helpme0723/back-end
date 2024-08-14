import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('KAKAO_REST_API_KEY'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URI'),
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _raw, _json, ...profileRest } = profile;
    const properties = _.mapKeys(_json.properties, (v, k) => {
      return _.camelCase(k);
    });
    const userEmail = _json.kakao_account.email;
    const userNickname = profile.displayName;
    const userProfileImg = _json.properties.profile_image;

    const user = await this.authService.findUserByEmail(userEmail);
    if (!user) {
      await this.authService.createSocialUser(
        userEmail,
        userNickname,
        userProfileImg,
        'kakao'
      );
    }

    if (!user.kakao) {
      await this.authService.changeProvider(userEmail, 'kakao');
    }
    return done(null, user);
  }
}
