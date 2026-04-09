import { Optional } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  businessName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsString()
  address: string;

  @IsOptional()
  socials?: {
    tiktok?: string; 
    instagram?: string;
    twitter?: string;
    facebook?: string; 
  };
}