import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, ValidateIf } from 'class-validator';

export class UpdateUserDto extends PickType(User, ['nickname', 'password', 'profileUrl', 'description']) {
  /**
   * 비밀번호 확인
   * 비밀번호가 입력됬을경우 조건부 동작
   */
  @ValidateIf((o) => o.password)
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  passwordConfirm: string;
}
