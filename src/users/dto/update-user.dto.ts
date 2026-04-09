import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
// import { IsOptional } from 'class-validator';

// All fields optional, password excluded from update
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
    // @IsOptional()
    // resetToken: string
}