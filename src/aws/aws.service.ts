import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
      },
    });
  }

  async imageUploadToS3(
    originalFileName: string, // 업로드될 파일의 원래 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string // 파일 확장자
  ) {
    // 고유한 파일 이름 생성
    const uniqueFileName = `${uuidv4()}-${originalFileName}`;

    // AWS S3에 이미지 업로드 명령을 생성합니다. 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정합니다.
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'), // S3 버킷 이름
      Key: uniqueFileName, // 업로드될 파일의 고유한 이름
      Body: file.buffer, // 업로드할 파일
      ACL: 'public-read', // 파일 접근 권한
      ContentType: `image/${ext}`, // 파일 타입
      Metadata: {
        originalFileName: originalFileName, // 원래 파일 이름을 메타데이터로 저장
      },
    });

    // 생성된 명령을 S3 클라이언트에 전달하여 이미지 업로드를 수행합니다.
    await this.s3Client.send(command);

    // 업로드된 이미지의 URL을 반환합니다.
    return `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${uniqueFileName}`;
  }
}