import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VisibilityType } from '../types/visibility.type';

export class UpdatePostDto {
  /**
   * @example '수정제목입니다'
   */
  @IsOptional()
  @IsString()
  title: string;

  /**
   * @example 'updatedContent"
   */
  @IsOptional()
  @IsString()
  content: string;

  /**
   * @example 'updatedPreview"
   */
  @IsOptional()
  @IsString()
  preview: string;

  /**
   * @example 40000
   */
  @IsOptional()
  @IsNumber()
  price: number;

  /**
   * @example 3
   */
  @IsOptional()
  @IsNumber()
  channelId: number;

  /**
   * @example 4
   */
  @IsOptional()
  @IsNumber()
  categoryId: number;

  /**
   * @example 5
   */
  @IsOptional()
  @IsNumber()
  seriesId?: number;

  /**
   * @example "PUBLIC"
   */
  @IsOptional()
  @IsEnum(Object.values(VisibilityType))
  visibility?: VisibilityType;
}
