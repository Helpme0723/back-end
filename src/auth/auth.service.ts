import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { SignUpDto } from './dtos/sign-up.dto';
import bcrypt from 'bcrypt';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { PointHistory } from 'src/point/entities/point-history.entity';
import { PointHistoryType } from 'src/point/types/point-history.type';
import { UtilsService } from 'src/utils/utils.service';
import { SocialProvider } from './types/social.type';
import { RecoveryPasswordDto } from './dtos/recovery-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    private readonly utilsService: UtilsService
  ) {}

  /**
   * 회원가입
   * @param signUpDto
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordConfirm, ...etc } = signUpDto;

    // 이메일 중복 조회
    await this.checkEmail(email);

    // 비밀번호와 비밀번호 확인 값이 다를 경우 예외 처리
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
      );
    }

    // 비밀번호 암호화
    const hashedPassword = bcrypt.hashSync(
      password,
      this.configService.get<number>('HASH_ROUND')
    );

    // 저장
    const userData = this.userRepository.create({
      email,
      ...etc,
      password: hashedPassword,
    });

    // 트랜잭션 queryRunner 세팅
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.save(User, userData);

      await queryRunner.manager.save(PointHistory, {
        userId: user.id,
        amount: user.point,
        type: PointHistoryType.INCOME,
        description: '회원가입 축하금',
      });

      user.password = undefined;
      user.deletedAt = undefined;

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException(
        '서버 에러가 발생했습니다. 문의 해주세요.'
      );
    }
  }

  /**
   * 이메일 중복 조회
   * @param email
   * @returns
   */
  async checkEmail(email: string) {
    // 해당 이메일이 있는지 조회
    const existedEmail = await this.userRepository.findOne({
      where: { email },
    });
    // 있을 경우 예외 처리
    if (existedEmail) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    return true;
  }

  /**
   * 회원가입 이메일 인증
   * @param email
   */
  async verifyEmail(email: string, verification: number) {
    // Redis Cloud에 담긴 인증번호와 입력한 인증번호 가져오기
    const verificationInRedis = await this.cacheManager.get<number>(
      `verifyCode:${email}`
    );

    // 같지 않을 경우 예외 처리
    if (verification !== verificationInRedis) {
      throw new BadRequestException('인증 번호가 틀렸습니다.');
    }

    await this.cacheManager.del(`verifyCode:${email}`);

    return true;
  }

  /**
   * 로그인
   * @param signInDto
   */
  async signIn(userId: number) {
    const payload = { id: userId };

    // 엑세스 토큰 생성
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES'),
    });
    // 리프레쉬 토큰 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES'),
    });
    // 리프레쉬 토큰 암호화
    const hashedRefreshToken = bcrypt.hashSync(
      refreshToken,
      this.configService.get<number>('HASH_ROUND')
    );

    // 레디스에 리프레쉬 토큰 있는지 조회
    const redisRefreshToken = await this.cacheManager.get<string>(
      `userId:${userId}`
    );
    // 이미 있으면 삭제
    if (redisRefreshToken) {
      await this.cacheManager.del(`userId:${userId}`);
    }

    const ttl = 60 * 60 * 24 * 7;
    // 레디스에 리프레쉬 토큰 저장
    await this.cacheManager.set(`userId:${userId}`, hashedRefreshToken, {
      ttl,
    });

    return { accessToken, refreshToken };
  }

  /**
   * 회원 탈퇴
   * @param userId
   * @returns
   */
  async reSign(userId: number, signInDto: SignInDto) {
    const { email, password } = signInDto;
    // 해당 ID를 가진 유저가 있는지 조회
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, email: true, password: true },
      relations: {
        channels: true,
        series: true,
        posts: true,
      },
    });

    // 유저가 없을 경우 예외 처리
    if (!user) {
      throw new NotFoundException('없는 회원입니다.');
    }

    if (user.email !== email) {
      throw new BadRequestException('이메일을 확인해 주세요.');
    }

    const isMatchedPassword = bcrypt.compareSync(password, user.password);

    if (!isMatchedPassword) {
      throw new BadRequestException('비밀번호를 확인해 주세요.');
    }

    // 레디스에 리프레쉬 토큰 있는지 조회
    const redisRefreshToken = await this.cacheManager.get<string>(
      `userId:${userId}`
    );

    // 없을 경우 예외 처리
    if (!redisRefreshToken) {
      throw new NotFoundException('토큰이 존재하지 않습니다.');
    }

    // 트랜잭션 queryRunner 세팅
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 트랜잭션 로직 시작
    try {
      // 유저 삭제
      await queryRunner.manager.softRemove(User, user);

      await this.cacheManager.del(`userId:${userId}`);

      // 트랜잭션 성공 시 커밋
      await queryRunner.commitTransaction();
      // 결과 적용
      await queryRunner.release();

      return true;
    } catch (error) {
      // 변경점 초기화
      await queryRunner.rollbackTransaction();
      // 결과 적용
      await queryRunner.release();
      // 에러 처리
      throw new InternalServerErrorException(
        '회원 탈퇴 과정 중에 오류가 발생했습니다. 관리자에게 문의해주세요.'
      );
    }
  }

  /**
   * 로그아웃
   * @param userId
   * @returns
   */
  async signOut(userId: number) {
    // userId에 맞는 유저가 있는지 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const redisRefreshToken = await this.cacheManager.get<string>(
      `userId:${userId}`
    );
    // 없으면 예외 처리
    if (!user || !redisRefreshToken) {
      throw new NotFoundException('없는 유저이거나 토큰이 존재하지 않습니다.');
    }

    // 레디스에 리프레쉬 토큰 삭제
    await this.cacheManager.del(`userId:${userId}`);
    return true;
  }

  // 토큰 재발급
  async tokenReIssue(token: string, userId: number) {
    const payload = { id: userId };

    // 레디스에 리프레쉬토큰이 이미 있는지 조회
    const redisRefreshToken = await this.cacheManager.get<string>(
      `userId:${userId}`
    );

    // 요청한 리프레쉬 토큰과 DB에 있는 토큰이 같은지 확인
    const isMatchedRefreshToken = bcrypt.compareSync(token, redisRefreshToken);

    // 리프레쉬 토큰이 다를 경우 예외 처리
    if (!isMatchedRefreshToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 유효하면 엑세스, 리프레쉬 토큰 재발급
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES'),
    });

    // 리프레쉬 토큰 암호화
    const hashedRefreshToken = bcrypt.hashSync(
      refreshToken,
      this.configService.get<number>('HASH_ROUND')
    );

    // 리프레쉬 토큰 만료 시간 설정
    const ttl = 60 * 60 * 24 * 7;
    // 암호화된 리프레쉬 토큰 저장
    await this.cacheManager.set(`userId:${userId}`, hashedRefreshToken, {
      ttl,
    });

    return { accessToken, refreshToken };
  }

  // 로그인 인증 정보가 일치하는지 확인
  async validateUser({ email, password }: SignInDto) {
    // 가입된 이메일이 있는지 조회
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });

    // 가입된 정보가 없을 경우
    if (!user) {
      throw new NotFoundException('인증 정보가 일치하지 않습니다.');
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

  // 리프레쉬토큰에 있는 userId로 DB에 있고 유저가 있는지 검증
  async findRefreshTokenById(userId: number) {
    const refreshToken = await this.cacheManager.get<string>(
      `userId:${userId}`
    );
    if (!refreshToken) {
      throw new NotFoundException('일치하는 인증 정보가 없습니다.');
    }
    await this.findUserById(userId);

    return userId;
  }

  // 소셜 로그인 해당 유저 있는지 찾기
  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      select: { id: true, deletedAt: true },
      where: { email },
      withDeleted: true,
    });

    if (user && user?.deletedAt !== null) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }

    return user;
  }

  // 가입하지 않은 이메일의 유저라면 유저 생성
  async createSocialUser(
    userId: string,
    userNickname: string,
    userProfileImg: string,
    provider: SocialProvider
  ) {
    const newSocialUser = this.userRepository.create({
      email: userId,
      nickname: userNickname,
      profileUrl: userProfileImg,
      [provider]: true,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = await queryRunner.manager.save(User, newSocialUser);

      await queryRunner.manager.save(PointHistory, {
        userId: newUser.id,
        amount: newUser.point,
        type: PointHistoryType.INCOME,
        description: '회원가입 축하금',
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  // 유저는 있지만 소셜 회원이 아니면 true로 변경해주기
  async changeProvider(email: string, provider: SocialProvider) {
    const user = await this.userRepository.findOneBy({ email });

    await this.userRepository.save({ ...user, [provider]: true });
  }

  // 소셜 로그인 액세스 토큰 발급용 코드 생성
  async createCode(userId: number) {
    // 코드를 키로 갖고, 유저아이디를 밸류로 갖기
    const code = this.utilsService.getUUID();
    // 코드 유효 시간
    const ttl = 30;
    // 코드 저장
    await this.cacheManager.set(code, userId, {
      ttl,
    });

    return code;
  }

  // 소셜 로그인 토큰 생성
  async createToken(code: string) {
    const userId = await this.cacheManager.get<number>(code);

    if (!userId) {
      throw new NotFoundException('유효하지 않은 코드입니다.');
    }

    const data = await this.signIn(userId);

    return data;
  }

  // 비밀번호 재설정
  async recoveryPassword(recoveryPasswordDto: RecoveryPasswordDto) {
    const { email, password, passwordConfirm, verifyCode } =
      recoveryPasswordDto;

    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('해당하는 유저가 존재하지 않습니다.');
    }

    await this.verifyEmail(email, verifyCode);

    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
      );
    }

    const hashedPassword = bcrypt.hashSync(
      password,
      this.configService.get<number>('HASH_ROUND')
    );

    await this.userRepository.save({ ...user, password: hashedPassword });

    return true;
  }
}
