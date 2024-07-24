import { Module } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscribe])],
  controllers: [SubscribeController],
  providers: [SubscribeService],
})
export class SubscribeModule {}
