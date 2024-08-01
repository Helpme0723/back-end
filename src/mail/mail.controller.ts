import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dtos/send-/mail.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('13.메일')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * 이메일로 인증번호 전송
   * @param to
   * @returns
   */
  @Post('/send')
  async sendMail(@Body() { mail }: SendMailDto) {
    const data = this.mailService.sendMail(mail);
    return {
      status: HttpStatus.OK,
      message: '메일 전송에 성공했습니다.',
      data: data,
    };
  }
}
