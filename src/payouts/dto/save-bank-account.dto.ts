import { IsString, Length } from 'class-validator';

export class SaveBankAccountDto {
  @IsString()
  bankName: string;

  @IsString()
  bankCode: string; // e.g "044" for Access Bank

  @IsString()
  @Length(10, 10, { message: 'Account number must be 10 digits' })
  accountNumber: string;
}