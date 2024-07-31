import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OrderType } from 'src/library/types/order.types';

export class FindAllPostDto {
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
  limit?: number = 1;

  @IsOptional()
  @IsEnum(OrderType, { message: '잘못된 필드입니다.' })
  sort?: OrderType = OrderType.DESC;
}
