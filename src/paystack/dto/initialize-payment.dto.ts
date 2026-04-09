import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString, minLength } from "class-validator";

export class InitializePaymentDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    phone: string;


  @IsNumber()
  @IsNotEmpty({ message: 'eventId is required' })
  eventId: number;
    @IsString()
    ticketId: string;


}