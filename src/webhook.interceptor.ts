import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/client';
import { catchError } from 'rxjs';

@Injectable()
export class SentryWebhookInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((error) => {
        //Sentry에 에러를 기록
        Sentry.captureException(error);
        //IncomingWebhook으로 인해 Slack으로 메시지를 보냄
        const slackWebhook = this.configService.get<string>('SLACK_WEBHOOk');
        const webhook = new IncomingWebhook(slackWebhook);
        webhook.send({
          // 메시지를 어떻게 보낼것인지
          attachments: [
            {
              color: 'danger',
              text: `:경광등: API 서버 에러발생:경광등:`,
              fields: [
                {
                  title: error.message,
                  value: error.stack,
                  short: false,
                },
              ],
              // 메시지가 전송된 시간
              ts: Math.floor(new Date().getTime() / 1000).toString(),
            },
          ],
        });
        // 요청의 흐름을 null로 인해 중단시킴.
        return null;
      })
    );
  }
}
