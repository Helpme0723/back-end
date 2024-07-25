import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';

export class ChannelIdDto extends PickType(Channel, ['id']) {}
