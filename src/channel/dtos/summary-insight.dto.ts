import { IsOptional } from 'class-validator';

export class SummaryInsightDto {
  @IsOptional()
  date?: string;
}
