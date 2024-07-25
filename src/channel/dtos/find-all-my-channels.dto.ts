import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllMyChannelsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
}
