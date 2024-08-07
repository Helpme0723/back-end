import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseList } from './entities/purchase-list.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePurchaseDto } from './dto/buy-post.dto';
import { PointHistory } from 'src/point/entities/point-history.entity';
import { PointHistoryType } from 'src/point/types/point-history.type';
import { VisibilityType } from 'src/post/types/visibility.type';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseList)
    private readonly purchaseRepository: Repository<PurchaseList>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    private readonly dataSource: DataSource
  ) {}

  async createPurchase(userId: number, createPurchaseDto: CreatePurchaseDto) {
    const { postId } = createPurchaseDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = await this.postRepository.findOne({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      if (post.visibility === VisibilityType.PRIVATE) {
        throw new BadRequestException('비공개 포스트는 구매할 수 없습니다.');
      }

      if (post.price === 0) {
        throw new BadRequestException(
          '가격이 0원인 포스트는 구매할 수 없습니다.'
        );
      }

      // 본인의 포스트인지 확인
      if (post.userId === userId) {
        throw new BadRequestException('본인의 포스트는 구매할 수 없습니다.');
      }

      if (user.point < post.price) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      const existingPurchase = await this.purchaseRepository.findOne({
        where: { userId, postId },
      });
      if (existingPurchase) {
        throw new BadRequestException('이미 구매한 포스트입니다.');
      }

      const purchase = this.purchaseRepository.create({
        userId,
        postId,
        price: post.price,
      });

      user.point -= post.price;
      // 포인트 히스토리 생성
      const pointHistory = this.pointHistoryRepository.create({
        userId,
        amount: post.price,
        type: PointHistoryType.OUTGOING,
        postId,
        description: post.title,
      });

      // salesCount 증가
      await this.postRepository.increment({ id: postId }, 'salesCount', 1);
      //TODO: 인크리먼트 도 쿼리 로 묶으면 좋을거같아요
      await queryRunner.manager.save(User, user);
      await queryRunner.manager.save(PurchaseList, purchase);
      await queryRunner.manager.save(PointHistory, pointHistory);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return purchase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException(`에러: ${error.message}`);
    }
  }
}
