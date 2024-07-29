import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Series } from './entities/series.entity';
import { Channel } from 'src/channel/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Series, Channel])],
  controllers: [SeriesController],
  providers: [SeriesService],
})
export class SeriesModule {}
