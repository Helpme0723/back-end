import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';

export class FindAllChannelsDto extends PickType(Channel, ['userId']) {}
