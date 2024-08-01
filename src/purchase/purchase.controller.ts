import { Controller, Post, Body, HttpStatus, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreatePurchaseDto } from './dto/buy-post.dto';

@ApiTags('09.구매')
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  /**
   * 포스트 구매
   * @param createPurchaseDto
   * @returns 구매 정보와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @UserInfo() user: User,
    @Body() createPurchaseDto: CreatePurchaseDto
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const data = await this.purchaseService.createPurchase(
      userId,
      createPurchaseDto
    );
    return {
      status: HttpStatus.OK,
      message: '포스트를 성공적으로 구매하였습니다.',
      data,
    };
  }
}
