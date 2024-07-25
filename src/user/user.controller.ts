import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('2. User API')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* 내 정보 조회 API */
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

  /* 사용자 정보 조회 */
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
}
