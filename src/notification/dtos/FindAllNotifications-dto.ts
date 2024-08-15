import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllNotificationsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;
}
