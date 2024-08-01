import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class FindAllSubscribesDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
