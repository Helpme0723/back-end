import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AwsService } from 'src/aws/aws.service';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { ConfigService } from '@nestjs/config';
import { UserProfileDto } from './dtos/read-user-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService
  ) {}

  /**
   * id값을 이용한 회원정보 조회 메서드
   * @param id 유저ID
   * @returns 회원객체
   */
  async findUserByMe(id: number) {
    const userInfo = await this.userRepository.findOneBy({ id });

    if (!userInfo) {
      throw new NotFoundException('회원을 찾을수 없습니다.');
    }
    return userInfo;
  }

  /**
   * 조회권한을 제어한 사용자정보 조회 메서드
   * @param id userId
   * @returns 사용자 정보
   */
  async findUserById(id: number) {
    const userInfo = await this.userRepository.findOneBy({ id });

    if (!userInfo) {
      throw new NotFoundException('회원을 찾을 수 없습니다.');
    }

    const userProfile = new UserProfileDto();
    userProfile.id = userInfo.id;
    userProfile.email = userInfo.email;
    userProfile.nickname = userInfo.nickname;
    userProfile.profileUrl = userInfo.profileUrl;
    userProfile.description = userInfo.description;
    userProfile.createdAt = userInfo.createdAt;

    return userProfile;
  }

  /**
   * id값을 이용한 패스워드 조회 매서드
   * @param id id값
   * @returns 패스워드 정보
   */
  async findUserPasswordById(id: number) {
    const userPasswordInfo = await this.userRepository.findOne({
      where: { id: id },
      select: ['password'],
    });

    if (!userPasswordInfo) {
      throw new NotFoundException('회원을 찾을수 없습니다.');
    }
    return userPasswordInfo;
  }

  /**
   * 회원정보 변경 메서드
   * @param user 사용자 정보
   * @param updateUserDto
   * @param file 파일 업로드시
   * @returns
   */
  async updateUserInfo(
    user: User,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File
  ) {
    const { nickname, profileUrl, description } = updateUserDto;

    // DTO와 파일이 모두 null일 때 에러 처리
    if (!nickname && !profileUrl && !description && !file) {
      throw new BadRequestException('수정할 정보를 입력해주세요');
    }

    const updateData: Partial<User> = {};

    // 파일이 제공된 경우
    if (file) {
      const uploadResult = await this.awsService.saveImage(file);
      updateData.profileUrl = uploadResult.imageUrl;
    } else if (profileUrl) {
      // 파일이 제공되지 않았을 때만 주소로 제공될 경우 업데이트
      updateData.profileUrl = profileUrl;
    }

    if (nickname) {
      updateData.nickname = nickname;
    }

    if (description) {
      updateData.description = description;
    }

    await this.userRepository.update(user.id, updateData);
  }

  /**
   * 비밀번호 변경 매서드
   * @param user 유저정보
   * @param updateUserPasswordDto 이전 비밀번호, 비밀번호확인 값
   */
  async updateUserPassword(
    userId: number,
    updateUserPasswordDto: UpdateUserPasswordDto
  ) {
    const { password, newPassword, newPasswordConfirm } = updateUserPasswordDto;

    // 비밀번호와 비밀번호 확인 값이 다를 경우 예외 처리
    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException('비밀번호 확인이 일치하지 않습니다.');
    }

    // 기존 패스워드 조회
    const currentUser = await this.findUserPasswordById(userId);
    if (!currentUser) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    // 입력된 현재 비밀번호가 실제 비밀번호와 일치하는지 확인
    const isPasswordValid = await bcrypt.compare(
      password,
      currentUser.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    const isSamePassword = await bcrypt.compare(
      newPassword,
      currentUser.password
    );
    if (isSamePassword) {
      throw new BadRequestException('같은 비밀번호는 사용할 수 없습니다.');
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('HASH_ROUND')
    );

    // 비밀번호 업데이트
    await this.userRepository.update(
      { id: userId },
      { password: hashedPassword }
    );
  }
}
