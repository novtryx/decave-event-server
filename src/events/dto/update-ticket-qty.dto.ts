import { IsString, IsNumber, Min } from 'class-validator';

export class UpdateTicketQtyDto {
  @IsString()
  ticketId: string;

  @IsNumber()
  @Min(1)
  qtySold: number;
}