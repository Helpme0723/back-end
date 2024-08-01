import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';

@ApiTags('02. User API')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 내정보 조회
   * @param user 유저정보
   * @returns 조회된 정보
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회',
    description: '사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '내 정보 조회 성공',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findUserInfo(@UserInfo() user: User) {
    const data = await this.userService.findUserByMe(user.id);
    return {
      status: HttpStatus.OK,
      message: '내 정보 조회 성공.',
      data: data,
    };
  }

  /**
   * 사용자 정보 조회
   * @param id userId
   * @returns 조회된 정보
   */
  @ApiOperation({
    summary: '사용자 정보 조회',
    description: '특정 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 정보 조회 성공.',
  })
  @Get(':id')
  async findUserInfoById(@Param('id') id: number) {
    const data = await this.userService.findUserById(id);
    return {
      status: HttpStatus.OK,
      message: '사용자 정보 조회 성공.',
      data: data,
    };
  }

  /**
   * 내 정보 수정
   * @param user 유저정보
   * @param updateUserDto 수정할 정보
   * @param file 파일 입력
   * @returns 결과
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 변경',
    description: '사용자의 정보를 변경합니다.',
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: HttpStatus.OK,
    description: '내 정보 변경 성공.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', nullable: true },
        nickname: { type: 'string', example: 'new_nickname', nullable: true },
        profileUrl: {
          type: 'string',
          example: 'https://example.com/profile.jpg',
          nullable: true,
        },
        description: {
          type: 'string',
          example: 'New description',
          nullable: true,
        },
      },
    },
  })
  @Patch('me')
  async updateUserInfo(
    @UserInfo() user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    await this.userService.updateUserInfo(user, updateUserDto, file);

    return {
      status: HttpStatus.OK,
      message: '내 정보 변경 성공.',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '비밀번호 변경',
    description: '사용자의 비밀번호를 변경 합니다.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/password')
  async updateUserPassword(
    @UserInfo() user: User,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto
  ) {
    await this.userService.updateUserPassword(user.id, updateUserPasswordDto);
    return {
      status: HttpStatus.OK,
      message: '비밀번호 변경 완료',
    };
  }
}
