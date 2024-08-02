import { IsNumber, IsOptional, Min } from 'class-validator';
import { InsightSort } from '../types/insight-sort.type';
import { Type } from 'class-transformer';

export class FindMonthlyInsightsDto {
  /**
   * @example "2024-06"
   */
  @IsOptional()
  date?: string;

  @IsOptional()
  sort?: InsightSort = InsightSort.VIEW;

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
