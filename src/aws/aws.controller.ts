import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('12.Aws API')
@Controller('images')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  // 이미지 업로드
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.awsService.imageUpload(file);

    return imageUrl;
  }
}
