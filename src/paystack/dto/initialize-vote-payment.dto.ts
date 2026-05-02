// dto/initialize-vote-payment.dto.ts
import { IsString, IsNumber, IsEmail, IsUUID, Min } from 'class-validator';

export class InitializeVotePaymentDto {
  @IsUUID()
  competitionId: string;

  @IsUUID()
  contestantId: string;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsEmail()
  voterEmail: string;

  @IsString()
  voterName: string;
} 