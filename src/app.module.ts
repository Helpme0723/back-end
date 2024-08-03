import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { configModuleValidationSchema } from './configs/env-validation.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from './configs/database.config';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { SeriesModule } from './series/series.module';
import { CommentModule } from './comment/comment.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { PointModule } from './point/point.module';
import { PurchaseModule } from './purchase/purchase.module';
import { AwsModule } from './aws/aws.module';
import { UtilsModule } from './utils/utils.module';
import { LibraryModule } from './library/library.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InsightModule } from './insight/insight.module';
import { MailModule } from './mail/mail.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    ScheduleModule.forRoot(),
    UserModule,
    PostModule,
    AuthModule,
    ChannelModule,
    SeriesModule,
    CommentModule,
    SubscribeModule,
    PointModule,
    PurchaseModule,
    AwsModule,
    UtilsModule,
    LibraryModule,
    InsightModule,
    MailModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
