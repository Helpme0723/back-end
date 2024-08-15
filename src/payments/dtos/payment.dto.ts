import { IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  impUid: string;

  @IsString()
  merchantUid: string;
}
