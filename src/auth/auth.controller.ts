/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Delete, Get, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dtos/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('1.auth')
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
  @Get('/existed-email')
  async existedEmail(@Query() email: string) {
    const data = await this.authService.existedEmail(email);

    return {
      status: HttpStatus.OK,
      message: 'true',
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
   * 회원 탈퇴
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('/resign')
  async reSign(@UserInfo() user: User) {
    const data = await this.authService.reSign(user.id);
    return {
      status: HttpStatus.OK,
      message: '삭제에 성공했습니다.',
      data: data,
    };
  }
}
