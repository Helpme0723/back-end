import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  // 이미지 업로드
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.awsService.imageUpload(file);

    return imageUrl;
  }
}
