import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  /**
   * 댓글 내용
   * @example "이것은 수정된 댓글입니다."
   */
  @IsNotEmpty() // TODO: 필수값으로 수정
  @IsString()
  content: string;
}
