import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * 이메일로 인증번호 전송
   * @param to
   * @returns
   */
  @Post('/send')
  async sendMail(@Body('to') to: string) {
    const data = await this.mailService.sendMail(to);
    return {
      status: HttpStatus.OK,
      message: '메일 전송에 성공했습니다.',
      data: data,
    };
  }
}
