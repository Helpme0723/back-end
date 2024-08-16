import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaymentDto } from './dtos/payment.dto';

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
    console.log(user.id);
    const data = await this.paymentsService.verifyPayment(user.id, paymentDto);

    return {
      status: HttpStatus.OK,
      message: '결제 검증 완료',
      data,
    };
  }

  @Post('refund')
  async refund(@Body('impUid') impUid: string) {
    console.log('!!!!!!!!!!!!!!!!!!');
    await this.paymentsService.refund(impUid);
    return true;
  }
}
