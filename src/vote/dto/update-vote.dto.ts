import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PricingType } from '../vote.entity';

export class UpdateContestantDto {
  @IsUUID()
  @IsOptional()
  id?: string; // present = update existing; absent = new contestant

  @IsString()
  name: string;

  @IsString()
  tagline: string;

  @IsString()
  category: string;

  @IsString()
  photoUrl: string;
}

export class UpdateVoteDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  edition?: string;

  @IsDateString()
  @IsOptional()
  voteStart?: string;

  @IsDateString()
  @IsOptional()
  voteEnd?: string;

  @IsEnum(PricingType)
  @IsOptional()
  pricing?: PricingType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerVote?: number;

  @IsBoolean()
  @IsOptional()
  showLiveCount?: boolean;

  @IsBoolean()
  @IsOptional()
  publicLeaderboard?: boolean;

  @IsBoolean()
  @IsOptional()
  oneVotePerDevice?: boolean;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsBoolean()
  @IsOptional()
  organizerPays?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateContestantDto)
  contestants?: UpdateContestantDto[];
}