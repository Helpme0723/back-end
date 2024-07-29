import { IsOptional } from 'class-validator';
import { InsightSort } from '../types/insight-sort.type';

export class FindDailyInsightsDto {
  /**
   * @example "2024-07-28"
   */
  @IsOptional()
  date?: string;

  @IsOptional()
  sort?: InsightSort = InsightSort.VIEW;
}
