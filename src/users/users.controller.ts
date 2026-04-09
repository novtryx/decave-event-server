import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users/register — public
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  // POST /users/login — public
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  // GET /users — protected
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/:id — protected
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id); 
  }
 
  @UseGuards(JwtAuthGuard)
@Patch('update-password')
updatePassword(
  @Req() req: {user: {email: string }},
  @Body() dto: UpdatePasswordDto,
) {
  const userEmail = req.user.email; // ✅ this is your user id
  return this.usersService.updatePassword(userEmail, dto);
}
  // PATCH /users/:id — protected
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // DELETE /users/:id — protected
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }


  @Post('forgot-password')
async forgotPassword(@Body('email') email: string) {
  await this.usersService.forgotPassword(email);
  return { message: 'If that email exists, a reset link has been sent.' };
}

@Post('reset-password')
async resetPassword(
  @Body('token') token: string,
  @Body('newPassword') newPassword: string,
) {
  await this.usersService.resetPassword(token, newPassword);
  return { message: 'Password reset successful' };
}

@Post('verify-email')
async verifyEmail(@Body('token') token: string) {
  return this.usersService.verifyEmail(token);
}


@Post('resend-verification')
async resendVerification(@Body('email') email: string) {
  return this.usersService.resendVerificationEmail(email);
}
} 