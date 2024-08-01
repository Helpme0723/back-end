import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty({ message: '구매할 포스트id를 입력해 주세요.' })
  @IsNumber()
  postId: number;
}
