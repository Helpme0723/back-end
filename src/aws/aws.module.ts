import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/utils/utils.module';
import { AwsController } from './aws.controller';

@Module({
  imports: [ConfigModule, UtilsModule],
  providers: [AwsService],
  exports: [AwsService],
  controllers: [AwsController],
})
export class AwsModule {}
