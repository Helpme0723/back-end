import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../types/order.types';
import { SortField } from '../types/field.types';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsEnum(OrderType, { message: '잘못된 순서입니다' })
  order?: OrderType = OrderType.DESC;

  @IsOptional()
  @IsEnum(SortField, { message: '잘못된 필드입니다.' })
  sort?: SortField = SortField.DATE;
}
