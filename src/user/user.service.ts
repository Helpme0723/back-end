import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AwsService } from 'src/aws/aws.service';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly awsService: AwsService
  ) {}

  /**
   * id값을 이용한 회원정보 조회 메서드
   * @param id 유저ID
   * @returns 회원객체
   */
  async findUserById(id: number) {
    const userInfo = await this.userRepository.findOneBy({ id });

    if (!userInfo) {
      throw new NotFoundException('회원을 찾을수 없습니다.');
    }
    return userInfo;
  }

  /**
   * id값을 이용한 패스워드 조회 매서드
   * @param id id값
   * @returns 패스워드 정보
   */
  async findUserPasswordById(id: number) {
    const userPasswordInfo = await this.userRepository.findOne({ where: { id: id }, select: ['password'] });

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
  async updateUserInfo(user: User, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    // 파일이 제공된 경우
    if (file) {
      const uploadResult = await this.awsService.saveImage(file);
      user.profileUrl = uploadResult.imageUrl;
    }

    const { nickname, profileUrl, description } = updateUserDto;

    if (nickname) {
      user.nickname = nickname;
    }

    // 파일이아닌 주소로 제공될 경우
    if (profileUrl) {
      user.profileUrl = profileUrl;
    }

    if (description) {
      user.description = description;
    }
    await this.userRepository.update({ id: user.id }, updateUserDto);
  }

  /**
   * 비밀번호 변경 매서드
   * @param user 유저정보
   * @param updateUserPasswordDto 비밀번호, 비밀번호확인 값
   */
  async updateUserPassword(user: User, updateUserPasswordDto: UpdateUserPasswordDto) {
    const { password, passwordConfirm } = updateUserPasswordDto;

    // 비밀번호와 비밀번호 확인 값이 다를 경우 예외 처리
    if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호 확인이 일치하지 않습니다.');
    }

    //패스워드 조회
    const currentUserPassword = await this.findUserPasswordById(user.id);

    const isPasswordValid = await bcrypt.compare(password, currentUserPassword.password);

    if (isPasswordValid) {
      throw new UnauthorizedException('같은 비밀번호는 사용할 수 없습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.update({ id: user.id }, { password: hashedPassword });
  }
}
