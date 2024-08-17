import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RecoveryPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  passwordConfirm: string;

  @IsNotEmpty()
  @IsNumber()
  verifyCode: number;
}
