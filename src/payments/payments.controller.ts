import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaymentDto } from './dtos/payment.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders')
  async createOrder(
    @UserInfo() user: User,
    @Body('pointMenuId') pointMenuId: number
  ) {
    const data = await this.paymentsService.createOrder(user.id, pointMenuId);

    return {
      status: HttpStatus.OK,
      message: '주문 내역 저장 완료',
      data,
    };
  }

  @Post('complete')
  async verifyPayment(@UserInfo() user: User, @Body() paymentDto: PaymentDto) {
    const data = await this.paymentsService.verifyPayment(user.id, paymentDto);

    return {
      status: HttpStatus.OK,
      message: '결제 검증 완료',
      data,
    };
  }
  // 결제 취소
  @Post('refund')
  async refund(@Body('impUid') impUid: string) {
    await this.paymentsService.refund(impUid);
    return {
      status: HttpStatus.OK,
      message: '결제 취소 완료',
    };
  }

  // 10분마다 실행
  // 주문 정보 삭제
  @Cron(CronExpression.EVERY_10_MINUTES)
  async deletePendingOrderAfterThirty() {
    console.log(`유효기간 지난 주문 정보 삭제`);
    await this.paymentsService.deletePendingOrderAfterThirty();
  }
}
