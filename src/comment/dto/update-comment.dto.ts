import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  /**
   * 댓글 내용
   * @example "이것은 수정된 댓글입니다."
   */
  @IsNotEmpty({ message: '수정할 댓글내용을 입력해 주세요.' }) // TODO: 필수값으로 수정
  @MaxLength(255, { message: '댓글은 최대 255글자까지 입력 가능합니다.' })
  @IsString()
  content: string;
}
