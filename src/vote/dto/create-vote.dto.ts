import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PricingType } from '../vote.entity';

export class CreateContestantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tagline: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  photoUrl: string;
}

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
   @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  edition: string;

  @IsDateString()
  voteStart: string;

  @IsDateString()
  voteEnd: string;

  @IsEnum(PricingType)
  pricing: PricingType;

  @IsNumber()
  @Min(0)
  pricePerVote: number;

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
  @Type(() => CreateContestantDto)
  contestants?: CreateContestantDto[];
}