import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllChannelsDto extends PickType(Channel, ['userId']) {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
