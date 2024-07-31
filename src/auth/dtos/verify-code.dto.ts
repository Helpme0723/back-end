import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsNotEmpty({ message: '인증번호를 받은 이메일을 입력해주세요.' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: '발급받은 인증번호를 입력해 주세요.' })
  @IsNumber()
  code: number;
}
