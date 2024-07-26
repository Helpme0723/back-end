import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllChannelsDto extends PickType(Channel, ['userId']) {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
  // TODO: limit 추가
}
