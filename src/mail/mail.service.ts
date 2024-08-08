import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  // 메일 전송을 담당하는 transporter 객체 선언
  private transporter;

  // 생성자 함수는 configService를 주입받아 초기화함
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    // nodemailer의 createTransport 메서드를 사용해 transporter 객체 생성
    this.transporter = nodemailer.createTransport({
      // 메일 서버의 호스트 주소를 configService에서 가져옴
      host: this.configService.get<string>('NODEMAILER_HOST'),
      // 메일 서버의 포트 설정
      port: this.configService.get<number>('NODEMAILER_PORT'),
      // 보안 연결 여부 설정
      secure: false,
      auth: {
        // 메일 서버 인증을 위한 사용자 이름을 configService에서 가져옴
        user: this.configService.get<string>('NODEMAILER_USER'),
        // 메일 서버 인증을 위한 비밀번호를 configService에서 가져옴
        pass: this.configService.get<string>('NODEMAILER_PASSWORD'),
      },
    });
  }
  // 이메일로 인증번호 전송
  sendMail(to: string) {
    try {
      // 난수 인증 번호
      const randomNumber = Math.floor(Math.random() * 899999) + 100000;
      const ttl = 60 * 5;
      this.transporter.sendMail({
        // from: 'rlashdmf123@gmail.com', // 보내는 사람의 이메일 주소를 설정
        to: to, // 받는 사람의 이메일 주소를 설정
        subject: `TalentVerse 회원가입 이메일 인증입니다.`, // 메일의 제목 설정
        text: `TalentVerse 가입하기 - 이메일 인증,
				인증 번호: ${randomNumber}`, // 메일의 내용 설정
      });

      console.log('메일이 전송되었습니다.');
      this.cacheManager.set(`인증 번호:${to}`, randomNumber, { ttl });
      return {
        보낸사람: this.configService.get<string>('NODEMAILER_USER'),
        받는사람: to,
        제목: `TalentVerse 회원가입 이메일 인증입니다.`,
        내용: `TalentVerse 가입하기 - 이메일 인증,
				인증 번호: ${randomNumber}`,
      };
    } catch (error) {
      console.log('메일 전송 중 오류가 발생했습니다.', error);
      throw new BadRequestException();
    }
  }
}
