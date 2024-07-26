import { PickType } from '@nestjs/swagger';
import { Series } from '../entities/series.entity';

export class UpdateSeriesDto extends PickType(Series, ['title', 'description', 'channelId']) {}
