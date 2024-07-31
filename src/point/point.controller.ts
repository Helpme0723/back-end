import { Controller, Get, UseGuards, HttpStatus, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PointService } from './point.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { MakeChoiceDto } from './dtos/make-choice.dto';

@ApiTags('10.포인트')
@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * 유저 포인트 히스토리
   * @param createPurchaseDto
   * @returns 포인트 증감와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/history')
  async getHistory(@UserInfo() user: User) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const data = await this.pointService.findPointHistory(userId);
    return {
      status: HttpStatus.OK,
      message: '포인트 히스토리 조회 성공',
      data,
    };
  }

  /**
   * 초이스 추가
   * @param makeChoiceDto
   * @returns
   */
  @Post('/choice') //추후 롤가드로 어드민 만 가능하게 추가해주기
  async makeChoice(@Body() makeChoiceDto: MakeChoiceDto) {
    const data = await this.pointService.createChoice(makeChoiceDto);

    return {
      status: HttpStatus.CREATED,
      message: '초이스를 만드는데 성공하였습니다',
      data,
    };
  }
  //구매자 정보와 상품 정보 넘겨주기
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/details/:id')
  async getPurchaseDetails(@UserInfo() user: User, @Param('id', ParseIntPipe) id: number) {
    console.log('여긴오나?');
    const userId = user.id;
    const data = await this.pointService.getDetail(userId, id);
    return data;
  }
}
