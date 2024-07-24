import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { AwsModule } from 'src/aws/aws.module';
import { MulterModule } from '@nestjs/platform-express';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import multerS3 from 'multer-s3';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    AwsModule,
    MulterModule.registerAsync({
      imports: [AwsModule],
      inject: ['S3_CLIENT'],
      useFactory: (s3: S3Client) => ({
        storage: multerS3({
          s3,
          bucket: process.env.AWS_S3_BUCKET_NAME,
          acl: 'public-read',
          metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
          },
          key: (req, file, cb) => {
            cb(null, `${uuid()}-${file.originalname}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          cb(null, true);
        },
      }),
    }),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
