import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChannelDto {
  /**
   * 수정할 채널명
   * @example "채널 수정 테스트"
   */
  @IsOptional()
  @MaxLength(30, { message: '채널명은 최대 30글자까지 입력 가능합니다.' })
  @IsString()
  title: string;

  /**
   * 수정할 채널 소개
   * @example "채널 수정 테스트입니다."
   */
  @IsOptional()
  @MaxLength(200, { message: '채널 소개는 최대 200글자까지 입력 가능합니다.' })
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}
