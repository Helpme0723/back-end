import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PaymentDto } from './dtos/payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { PointOrder } from 'src/point/entities/point-order.entity';
import { PointMenu } from 'src/point/entities/point-menu-entity';
import { PointHistory } from 'src/point/entities/point-history.entity';
import { PointHistoryType } from 'src/point/types/point-history.type';
import { error } from 'console';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointOrder)
    private readonly pointOrderRepository: Repository<PointOrder>,
    @InjectRepository(PointMenu)
    private readonly pointMenuRepository: Repository<PointMenu>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource
  ) {}

  // 포트원 토큰 발급
  async getPortoneToken() {
    const options: AxiosRequestConfig = {
      method: 'post',
      url: 'https://api.iamport.kr/users/getToken',
      headers: { 'Content-Type': 'application/json' },
      data: {
        imp_key: this.configService.get<string>('PORTONE_REST_API_KEY'),
        imp_secret: this.configService.get<string>('PORTONE_SECRET_KEY'),
      },
    };

    try {
      const { data } = await axios.request(options);
      return data.response.access_token;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // 결제내역 단건조회
  async getPaymentsHistoryFromImpUid(impUid: string) {
    // 토큰 발급
    const token = await this.getPortoneToken();
    console.log(token);
    const options: AxiosRequestConfig = {
      method: 'GET',
      url: `https://api.iamport.kr/payments/${impUid}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {},
    };

    try {
      const response: AxiosResponse = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment Info', error);
      throw error;
    }
  }
  // 결제 취소
  async refund(impUid: string) {
    const token = await this.getPortoneToken();
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://api.iamport.kr/payments/cancel',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        imp_uid: `${impUid}`,
      },
    };

    try {
      const response: AxiosResponse = await axios.request(options);
      console.log('결제 취소 성공', response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 주문 정보 저장
  async createOrder(userId: number, pointMenuId: number) {
    const merchantUid = `payment-${crypto.randomUUID()}`;
    const pointMenu = await this.pointMenuRepository.findOneBy({
      id: pointMenuId,
    });
    if (!pointMenu) {
      throw new BadRequestException('올바르지 않은 주문 금액입니다.');
    }
    await this.pointOrderRepository.save({
      merchantUid,
      userId,
      amount: pointMenu.price,
      pointMenuId,
    });

    return { merchantUid, amount: pointMenu.price };
  }

  // 결제 검증
  async verifyPayment(userId: number, paymentDto: PaymentDto) {
    const { impUid, merchantUid } = paymentDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('없는 유저입니다.');
    }

    // 결제 단건 조회
    const paymentHistory = await this.getPaymentsHistoryFromImpUid(impUid);
    if (!paymentHistory) {
      throw new NotFoundException('유효하지 않은 결제내역입니다.');
    }

    const order = await this.pointOrderRepository.findOneBy({ merchantUid });
    if (!order) {
      throw new NotFoundException('찾을 수 없는 주문정보입니다.');
    }

    // 트랜잭션 queryRunner 세팅
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (
        order.amount === paymentHistory.response.amount &&
        paymentHistory.response.status === 'paid'
      ) {
        await queryRunner.manager.save(PointHistory, {
          userId,
          amount: paymentHistory.response.amount,
          type: PointHistoryType.INCOME,
          description: `${paymentHistory.response.amount} 충전`,
        });
        await queryRunner.manager.increment(
          User,
          { id: userId },
          'point',
          paymentHistory.response.amount
        );
      }
      throw error;
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // 결제 취소
      await this.refund(paymentHistory.response.imp_uid);
      throw new InternalServerErrorException(
        '결제 검증 중 문제가 발생했습니다.'
      );
    } finally {
      await queryRunner.release();
    }
  }
}
