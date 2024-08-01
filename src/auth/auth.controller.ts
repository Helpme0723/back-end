/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dtos/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { AuthGuard } from '@nestjs/passport';
import { EmailConflictDto } from './dtos/email-conflict.dto';
import { VerifyCodeDto } from './dtos/verify-code.dto';

@ApiTags('01.auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   * @param signUpDto
   * @returns
   */
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const data = await this.authService.signUp(signUpDto);

    return {
      status: HttpStatus.CREATED,
      message: '회원가입에 성공했습니다.',
      data: data,
    };
  }

  /**
   * 이메일 중복 조회
   * @param param0
   * @returns
   */
  @Post('/check-email')
  async checkEmail(@Body() { email }: EmailConflictDto) {
    const data = await this.authService.checkEmail(email);

    return {
      status: HttpStatus.OK,
      message: 'true',
      data: data,
    };
  }

  /**
   * 이메일 인증
   * @param email
   * @param verification
   * @returns
   */
  @Post('/verify-email')
  async verifyEmail(@Body() { email, code }: VerifyCodeDto) {
    const data = await this.authService.verifyEmail(email, code);

    return {
      status: HttpStatus.OK,
      message: '인증되었습니다.',
      data: data,
    };
  }

  /**
   * 로그인
   * @param user
   * @param signInDto
   * @returns
   */
  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(@UserInfo() user: User, @Body() signInDto: SignInDto) {
    const data = await this.authService.signIn(user.id);

    return {
      status: HttpStatus.OK,
      message: '로그인에 성공했습니다.',
      data: data,
    };
  }

  /**
   * 로그아웃
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('/sign-out')
  async signOut(@UserInfo() user: User) {
    const data = await this.authService.signOut(user.id);

    return {
      status: HttpStatus.OK,
      message: '로그아웃에 성공했습니다.',
      data: data,
    };
  }

  /**
   * 토큰 재발급
   * @param token
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('refresh'))
  @Post('tokens')
  async tokenReIssue(
    @Headers('Authorization') token: string,
    @UserInfo() user: User
  ) {
    const refreshToken = token.split(' ')[1];
    const data = await this.authService.tokenReIssue(refreshToken, user.id);
    return {
      status: HttpStatus.OK,
      message: '토큰 재발급에 성공했습니다.',
      data: data,
    };
  }

  /**
   * 회원 탈퇴
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/re-sign')
  async reSign(@UserInfo() user: User) {
    const data = await this.authService.reSign(user.id);
    return {
      status: HttpStatus.OK,
      message: '삭제에 성공했습니다.',
      data: data,
    };
  }
}
