import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateSeriesDto {
  @IsNotEmpty({ message: '수정할 제목을 입력해주세요' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '수정할 설명을 입력해주세요' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: '수정할 제목을 입력해주세요' })
  @IsNumber()
  channelId: number;
}
