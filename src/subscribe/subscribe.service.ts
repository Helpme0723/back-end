import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { DataSource, Repository } from 'typeorm';
import { Channel } from 'src/channel/entities/channel.entity';
import { CHANNEL_LIMIT } from 'src/constants/page.constant';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Subscribe)
    private readonly subscribeRepository: Repository<Subscribe>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly dataSource: DataSource
  ) {}

  // 채널 구독
  async createSubscribe(userId: number, channelId: number) {
    // 해당 채널이 있는지 확인
    const channel = await this.channelRepository.findOneBy({ id: channelId });

    // 채널이 없으면 에러
    if (!channel) {
      throw new NotFoundException('해당 아이디의 채널이 없습니다.');
    }

    if (channel.userId === userId) {
      throw new BadRequestException('내 채널은 구독할 수 없습니다.');
    }

    // 해당 유저가 해당 채널을 이미 구독했는지 조회
    const existingSubscribe = await this.subscribeRepository.findOneBy({ userId, channelId });

    // 이미 구독했으면 오류
    if (existingSubscribe) {
      throw new ConflictException('이미 구독한 채널입니다.');
    }

    // 여기서부터 트랜잭션
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 채널의 subscribers에 +1 해서 저장
      await queryRunner.manager.increment(Channel, { id: channelId }, 'subscribers', 1);

      // subscribe에 구독 정보 저장
      const subscribeData = this.subscribeRepository.create({ userId, channelId });
      await queryRunner.manager.save(Subscribe, subscribeData);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  // 채널 구독 취소
  async deleteSubscribe(userId: number, channelId: number) {
    const subscribe = await this.subscribeRepository.findOneBy({ userId, channelId });

    if (!subscribe) {
      throw new BadRequestException('구독하지 않은 채널입니다.');
    }

    //여기부터 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 채널의 subscribers에 -1 해서 저장
      await queryRunner.manager.decrement(Channel, { id: channelId }, 'subscribers', 1);

      // subscribe에서 구독 정보 삭제
      await queryRunner.manager.delete(Subscribe, { id: subscribe.id });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  // 내 구독 목록 조회
  async findAllSubsCribe(userId: number, page: number, limit: number) {
    const offset = (page - 1) * limit; // TODO: limit 사용자가 전달하는 걸로 변경

    const [subscribes, total] = await this.subscribeRepository.findAndCount({
      where: { userId },
      relations: {
        channel: {
          user: true,
        },
      },
      skip: offset,
      take: limit,
    });

    if (page !== 1 && page > Math.ceil(total / limit)) {
      throw new NotFoundException('존재하지 않는 페이지입니다.');
    }

    return {
      subscribes: subscribes.map((subscribe) => ({
        id: subscribe.id,
        ownerId: subscribe.channel.user.id,
        ownerNickname: subscribe.channel.user.nickname,
        ownerProfileUrl: subscribe.channel.user.profileUrl,
        channelId: subscribe.channelId,
        title: subscribe.channel.title,
        description: subscribe.channel.description,
        imageUrl: subscribe.channel.imageUrl,
        subscribers: subscribe.channel.subscribers,
      })),
      total,
      page,
    };
  }
}
