import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseList } from './entities/purchase-list.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { PointHistory } from 'src/point/entities/point-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseList, Post, User, PointHistory])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
