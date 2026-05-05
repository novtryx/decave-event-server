// dto/update-ticket-sale-dates.dto.ts
import { IsOptional, IsDateString } from 'class-validator';

export class UpdateTicketSaleDatesDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  stopdate?: string;
}