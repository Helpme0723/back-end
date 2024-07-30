import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointHistory } from './entities/point-history.entity';
import { User } from 'src/user/entities/user.entity';
import { PointHistoryType } from './types/point-history.type';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
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
}
