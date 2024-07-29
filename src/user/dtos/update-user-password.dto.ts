import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPasswordDto extends PickType(User, ['password']) {
  //비밀번호 확인
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  @IsString()
  passwordConfirm: string;
}
