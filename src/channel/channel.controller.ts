import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imageUrl'))
  async createChannel(@Body() createChannelDto: CreateChannelDto, @UploadedFile() file?: Express.MulterS3.File) {
    const userId = 1;

    const data = await this.channelService.createChannel(userId, createChannelDto, file?.location);

    return data;
  }
}
