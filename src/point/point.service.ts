import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointHistory } from './entities/point-history.entity';
import { User } from 'src/user/entities/user.entity';
import { MakeChoiceDto } from './dtos/make-choice.dto';
import { PointMenu } from './entities/point-menu-entity';
import { PointHistoryType } from './types/point-history.type';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @InjectRepository(PointMenu)
    private readonly pointMenuRepository: Repository<PointMenu>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findPointHistory(userId: number, type?: PointHistoryType, sort: 'ASC' | 'DESC' = 'DESC') {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const queryBuilder = this.pointHistoryRepository.createQueryBuilder('pointHistory')
      .where('pointHistory.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('pointHistory.type = :type', { type });
    }

    queryBuilder.orderBy('pointHistory.createdAt', sort);

    return queryBuilder.getMany();
  }

  async createChoice(makeChoiceDto: MakeChoiceDto) {
    const choice = this.pointMenuRepository.create({
      ...makeChoiceDto,
    });
    await this.pointMenuRepository.save(choice);

    return choice;
  }

  async getDetail(userId: number, id: number) {
    const point = await this.pointMenuRepository.findOne({
      where: { id },
    });
    console.log('222', point);
    if (!point) {
      throw new NotFoundException('구매정보를 불러오지 못했습니다');
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    console.log('333', user);
    if (!user) {
      throw new NotFoundException('구매자 정보를 불러오지 못했습니다.');
    }

    return { point, user };
  }
}
