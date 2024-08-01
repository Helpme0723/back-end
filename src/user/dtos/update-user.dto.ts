import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  file?: any;

  @ApiProperty({ example: 'nickname' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: '안녕하세요.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '기본 이미지.jpg' })
  @IsString()
  @IsOptional()
  profileUrl?: string;
}
