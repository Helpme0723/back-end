import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';

export class FindOneChannelDto extends PickType(Channel, ['id']) {}
