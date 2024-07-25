import { PickType } from '@nestjs/swagger';
import { Subscribe } from '../entities/subscribe.entity';

export class CreateSubscribeDto extends PickType(Subscribe, ['channelId']) {}
