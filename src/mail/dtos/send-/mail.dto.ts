import { IsNotEmpty, IsString } from 'class-validator';

export class SendMailDto {
  /**
   * @example "email@domain.com"
   */
  @IsNotEmpty({ message: '인증번호를 받을 이메일을 입력해 주세요' })
  @IsString()
  mail: string;
}
