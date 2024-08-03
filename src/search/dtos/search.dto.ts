import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Field } from '../types/field.type';
import { Type } from 'class-transformer';
import { OrderType } from 'src/library/types/order.types';

export class SearchDto {
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @IsEnum(Field)
  @IsOptional()
  field?: Field;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsEnum(OrderType)
  @IsOptional()
  sort: OrderType = OrderType.DESC;
}
