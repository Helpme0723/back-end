import { PickType } from '@nestjs/swagger';
import { Series } from '../entities/series.entity';

export class CreateSeriesDto extends PickType(Series, [
  'title',
  'description',
  'channelId',
]) {}
