import { IsOptional } from 'class-validator';
import { InsightSort } from '../types/insight-sort.type';

export class FindMonthlyInsightsDto {
  /**
   * @example "2024-06"
   */
  @IsOptional()
  date?: string;

  @IsOptional()
  sort?: InsightSort = InsightSort.VIEW;
}
