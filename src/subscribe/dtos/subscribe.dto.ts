import { PickType } from '@nestjs/swagger';
import { Subscribe } from '../entities/subscribe.entity';

export class SubscribeDto extends PickType(Subscribe, ['channelId']) {}
