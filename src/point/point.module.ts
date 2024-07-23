import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointHistory } from './entities/point-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointHistory])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
