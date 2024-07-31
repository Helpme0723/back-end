import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllCommentsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @Type(() => Number)
  @IsInt()
  postId: number;
}
