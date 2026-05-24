import { IsNumber, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(100) // optional minimum withdrawal
  amount!: number;
}