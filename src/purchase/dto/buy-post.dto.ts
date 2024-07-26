import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty()
  @IsNumber()
  postId: number;
}
