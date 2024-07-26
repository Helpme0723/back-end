import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseList } from './entities/purchase-list.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePurchaseDto } from './dto/buy-post.dto';


@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseList)
    private readonly purchaseRepository: Repository<PurchaseList>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
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

      // 본인의 포스트인지 확인
      if (post.userId === userId) {
        throw new BadRequestException('본인의 포스트는 구매할 수 없습니다.');
      }

      if (user.point < post.price) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      const existingPurchase = await this.purchaseRepository.findOne({ where: { userId, postId } });
      if (existingPurchase) {
        throw new BadRequestException('이미 구매한 포스트입니다.');
      }

      const purchase = this.purchaseRepository.create({
        userId,
        postId,
        price: post.price,
      });

      user.point -= post.price;
      await this.userRepository.save(user);
      const savedPurchase = await this.purchaseRepository.save(purchase);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return savedPurchase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException(`에러: ${error.message}`);
    }
  }
}
