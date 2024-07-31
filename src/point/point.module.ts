import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointHistory } from './entities/point-history.entity';
import { User } from 'src/user/entities/user.entity';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { Post } from 'src/post/entities/post.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { PointMenu } from './entities/point-menu-entity';
import { PointOrder } from './entities/point-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseList, Post, User, PointHistory, PointMenu, PointOrder])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
