import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SaveBankAccountDto {
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @IsString()
  @IsNotEmpty()
  bankCode!: string;

  @IsString()
  @Length(10, 10)
  accountNumber!: string;
}