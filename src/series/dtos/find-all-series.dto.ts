import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OrderType } from 'src/library/types/order.types';

export class FindAllSeriesDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  channelId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(OrderType, { message: '잘못된 필드입니다.' })
  sort?: OrderType = OrderType.DESC;
}
