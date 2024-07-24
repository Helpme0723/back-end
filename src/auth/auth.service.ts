import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/sign-up.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * 회원가입
   * @param signUpDto
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordConfirm, ...etc } = signUpDto;

    // 이미 존재하는지 확인
    const existedEmail = await this.userRepository.findOne({
      where: { email },
    });

    // 이미 존재하는 이메일인 경우 예외 처리
    if (existedEmail) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호와 비밀번호 확인 값이 다를 경우 예외 처리
    if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 저장
    const user = await this.userRepository.save({
      email,
      ...etc,
      password: hashedPassword,
    });
    user.password = undefined;
    return user;
  }
}
