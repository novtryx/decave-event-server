import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateTicketDto {
  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  startQty: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  stopdate: string;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsString()
  venue: string;

  @IsString()
  address: string;

  @IsDateString()
  eventDate: string;

  @IsBoolean()
  @IsOptional()
  visibilty?: boolean;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  organizerPays: boolean;

  @IsUrl()
  banner: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketDto)
  tickets: CreateTicketDto[];
}