import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'nickname' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: '안녕하세요.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  file?: any;

  @ApiProperty({ example: '기본 이미지.jpg' })
  @IsString()
  @IsOptional()
  profileUrl?: string;
}
