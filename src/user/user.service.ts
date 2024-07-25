import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * 사용자 정보 조회 메서드
   * @param user 사용자
   * @returns 유저 정보 객체
   */
  async findUserInfo(user: User) {
    const userInfo = await this.findByEmail(user.email);
    return userInfo;
  }

  /**
   * userId로 회원정보 조회 메서드
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
}
