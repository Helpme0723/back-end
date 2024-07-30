import { Controller, Get, UseGuards, HttpStatus, Query } from '@nestjs/common';
import { PointService } from './point.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { PointHistoryType } from './types/point-history.type';

@ApiTags('10.포인트')
@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * 유저 포인트 히스토리
   * @param createPurchaseDto
   * @param type 포인트 히스토리 타입 (income 또는 outgoing)
   * @param sort 정렬 조건 (ASC 또는 DESC)
   * @returns 포인트 증감와 상태 메시지
   * */
  @ApiQuery({ name: 'type', required: false, enum: PointHistoryType })
  @ApiQuery({ name: 'sort', required: false, enum: ['ASC', 'DESC'] })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/history')
  async getHistory(
    @UserInfo() user: User,
    @Query('type') type?: PointHistoryType,
    @Query('sort') sort?: string,
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const sortLowerCase = sort ? sort.toUpperCase() : 'DESC';
    const validSort = sortLowerCase === 'ASC' || sortLowerCase === 'DESC' ? sortLowerCase : 'DESC';
    const data = await this.pointService.findPointHistory(userId, type, validSort);
    return {
      status: HttpStatus.OK,
      message: '포인트 히스토리 조회 성공',
      data,
    };
  }
}
