import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
      },
    });
  }
  /**
   * S3 이미지 업로드
   * @param file
   * @returns 이미지 업로드 실행 결과
   */
  async saveImage(file: Express.Multer.File) {
    return await this.imageUpload(file);
  }

  /**
   * S3 이미지 업로드
   * @param file 객체
   * @returns 파일url
   */
  async imageUpload(file: Express.Multer.File) {
    const imageName = this.utilsService.getUUID();
    const ext = file.originalname.split('.').pop();

    const imageUrl = await this.imageUploadToS3(
      `${imageName}.${ext}`,
      file,
      ext
    );

    return { imageUrl };
  }

  async imageUploadToS3(
    fileName: string, // 업로드될 파일의 원래 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string // 파일 확장자
  ) {
    // 고유한 파일 이름 생성

    // AWS S3에 이미지 업로드 명령을 생성합니다. 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정합니다.
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'), // S3 버킷 이름
      Key: `images/${fileName}`, // 업로드될 파일의 고유한 이름
      Body: file.buffer, // 업로드할 파일
      ACL: 'public-read', // 파일 접근 권한
      ContentType: `image/${ext}`, // 파일 타입
    });

    // 생성된 명령을 S3 클라이언트에 전달하여 이미지 업로드를 수행합니다.
    await this.s3Client.send(command);
    // 업로드된 이미지의 URL을 반환합니다.
    return `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/images/${fileName}`;
  }
}
