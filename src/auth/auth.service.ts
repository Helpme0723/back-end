import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/sign-up.dto';
import bcrypt from 'bcrypt';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
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
    user.deletedAt = undefined;
    return user;
  }

  /**
   * 로그인
   * @param signInDto
   */
  async signIn(userId: number) {
    const payload = { id: userId };

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /**
   * 회원 탈퇴
   * @param userId
   * @returns
   */
  async reSign(userId: number) {
    // 해당 ID를 가진 유저가 있는지 조회
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // 없을 경우 예외처리
    if (!user) {
      throw new NotFoundException('없는 회원입니다.');
    }

    // 삭제
    await this.userRepository.softDelete({ id: userId });

    return true;
  }

  // 가입된 유저인지 조회
  async validateUser({ email, password }: SignInDto) {
    // 가입된 이메일이 있는지 조회
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });

    // 이미 유저가 있을 경우 예외 처리
    if (!user) {
      throw new UnauthorizedException('인증 정보가 일치하지 않습니다.');
    }
    // 패스워드 일치 확인
    const isPasswordMatched = bcrypt.compareSync(password, user.password);

    // 일치하지 않을 경우 예외 처리
    if (!isPasswordMatched) {
      throw new UnauthorizedException('인증 정보가 일치하지 않습니다.');
    }
    // id: user.id 객체 반환
    return { id: user.id };
  }

  // 토큰의 id가 DB에 있는지 검증
  async findUserById(payloadId: number) {
    const user = await this.userRepository.findOne({
      where: { id: payloadId },
    });
    if (!user) {
      throw new UnauthorizedException('인증 정보가 일치하지 않습니다.');
    }
    return user.id;
  }
}
