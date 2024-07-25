import { Body, Controller, Get, HttpStatus, Param, Patch, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('2. User API')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 내 정보 조회
   * @param user 데코레이터에서 가저온 사용자 정보
   * @returns 내 정보 조회완료 메시지, data (패스워드 미포함)
   */
  // @UserGuards
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @Get('me')
  async findUserInfo(/* 데코레이터 필요 */ user: User) {
    const data = await this.userService.findUserInfo(user);
    return {
      status: HttpStatus.OK,
      message: '',
      data: data,
    };
  }

  /**
   * 다른 사용자 정보 조회
   * @param id 해당 유저의 id값
   * @returns 유저의 정보 조회완료 메시지, data (패스워드 미포함)
   */
  // @UserGuards
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @Get(':id')
  async findUserInfoById(@Param('id') id: string) {
    const data = await this.userService.findUserById(+id);
    return {
      status: HttpStatus.OK,
      message: '',
      data: data,
    };
  }

  /**
   * 내 정보 수정
   * @param user 사용자 정보
   * @param updateUserDto 변경할 정보
   * @param file 파일
   * @returns 성공와뇰 메시지
   */
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @Patch('me')
  async updateUserInfo(
    /* 데코레이터 */ user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const userInfo = this.userService.updateUserInfo(user, updateUserDto, file);

    return {
      status: HttpStatus.OK,
      message: '',
      data: userInfo,
    };
  }
}
