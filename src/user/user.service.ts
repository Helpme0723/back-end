import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly awsService: AwsService
  ) {}

  /**
   * 사용자 조회
   * @param user 유저정보
   * @returns 유저 정보 객체
   */
  async findUserInfo(user: User) {
    const userInfo = await this.findByEmail(user.email);

    return userInfo;
  }

  /**
   * id값을 이용한 회원정보 조회 메서드
   * @param id 유저ID
   * @returns 회원객체
   */
  async findUserById(id: number) {
    const userInfo = await this.userRepository.findOneBy({ id });

    if (!userInfo) {
      throw new NotFoundException('');
    }
    return userInfo;
  }

  /**
   * 이메일로 회원 찾기 메서드
   * @param email 이메일
   * @returns 회원 객체
   */
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  /**
   * 회원정보 수정 메서드
   * @param user 사용자 정보
   * @param updateUserDto
   * @param file 파일 업로드시
   * @returns
   */
  async updateUserInfo(user: User, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    // 파일이 제공된 경우
    if (file) {
      const uploadResult = await this.awsService.saveImage(file);
      user.profileUrl = uploadResult.imageUrl;
    }

    const { nickname, password, passwordConfirm, profileUrl, description } = updateUserDto;

    if (nickname) {
      user.nickname = nickname;
    }

    if (password) {
      // 비밀번호와 비밀번호 확인 값이 다를 경우 예외 처리
      if (password !== passwordConfirm) {
        throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      }
      user.password = bcrypt.hashSync(password, 10);
    }

    // 파일이아닌 주소로 제공될 경우
    if (profileUrl) {
      user.profileUrl = profileUrl;
    }

    if (description) {
      user.description = description;
    }
    await this.userRepository.update({ id: user.id }, updateUserDto);

    return { success: true };
  }
}
