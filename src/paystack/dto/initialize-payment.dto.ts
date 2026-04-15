import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, minLength } from "class-validator";

export class InitializePaymentDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    phone: string;


     @IsString()
      @IsOptional()
      location?: string;
    
      @IsString()
      @IsOptional()
      howDidYouHearAboutUs?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'eventId is required' })
  eventId: number;
    @IsString()
    ticketId: string;


} 