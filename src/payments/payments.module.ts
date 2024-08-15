import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PointOrder } from 'src/point/entities/point-order.entity';
import { PointMenu } from 'src/point/entities/point-menu-entity';
import { PointHistory } from 'src/point/entities/point-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PointOrder, PointMenu, PointHistory]),
    HttpModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
