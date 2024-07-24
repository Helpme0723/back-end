import { IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}
