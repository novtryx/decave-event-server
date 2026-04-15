import { IsString, IsEmail, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  paystackId: string;

  @IsBoolean()
  @IsOptional()
  checkedIn?: boolean;

  @IsString()
  @IsOptional()
  qrCode?: string;

  @IsNumber()
  amount: number;

  @IsString()
  ticketType: string;

  @IsString()
  phone: string;

  @IsNumber()
  eventId: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  howDidYouHearAboutUs?: string;
}