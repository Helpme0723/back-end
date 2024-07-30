import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class SignUpDto extends PickType(User, [
  'email',
  'password',
  'nickname',
]) {
  /**
   * 비밀번호 확인
   * @example "qwer1234"
   */
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  @IsString()
  passwordConfirm: string;
}
