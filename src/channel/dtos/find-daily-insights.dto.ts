import { IsNumber, IsOptional } from 'class-validator';
import { InsightSort } from '../types/insight-sort.type';
import { Type } from 'class-transformer';

export class FindDailyInsightsDto {
  /**
   * @example "2024-07-28"
   */
  @IsOptional()
  date?: string;

  @IsOptional()
  sort?: InsightSort = InsightSort.VIEW;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
