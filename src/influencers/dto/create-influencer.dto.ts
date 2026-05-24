import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class CreateInfluencerDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

 
  @IsOptional()
  @IsNumber()
  @Min(0)
  buyers?:number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsBoolean()
  influencersTakesPercentage?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}