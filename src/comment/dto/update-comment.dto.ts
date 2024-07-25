import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  /**
   * 댓글 내용
   * @example "이것은 수정된 댓글입니다."
   */
  @IsOptional()
  @IsString()
  content?: string;
}