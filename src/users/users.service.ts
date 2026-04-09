import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { UpdatePasswordDto } from './dto/update-password.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}


  // ─── Register ────────────────────────────────────────────────────────────────
  async register(dto: CreateUserDto): Promise<{ message: string }> {
    const existing = await this.usersRepository.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

        try {
          await this.usersRepository.save(user);

          try {
        await this.mailService.sendWelcomeEmail({
          user: { name: user.name, email: user.email },
        });
      } catch (mailError) {
        console.error('Failed to send welcome email:', mailError.message);
      }

      return { message: 'Registration successful' };
    } catch {
      throw new InternalServerErrorException('Could not create user');
    }
  }

  // ─── Login ───────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.usersRepository.findOneBy({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  // ─── Get All Users ───────────────────────────────────────────────────────────
  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  // ─── Get User By ID ──────────────────────────────────────────────────────────
  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    const { password, ...safeUser } = user;
    return safeUser;
  }

  // ─── Update User ─────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    // Check email conflict if email is being updated
    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.usersRepository.findOneBy({ email: dto.email });
      if (emailTaken) throw new ConflictException('Email already in use');
    }

    Object.assign(user, dto);

    const updated = await this.usersRepository.save(user);
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  // ─── Delete User ─────────────────────────────────────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    await this.usersRepository.remove(user);
    return { message: `User #${id} deleted successfully` };
  }

  async forgotPassword(email: string) {
  const user = await this.usersRepository.findOneBy({email});
  if (!user) return; // don't reveal if email exists

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await this.usersRepository.update(user.id, {
    resetToken: token,
    resetTokenExpiry: expiry,
  });
 
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await this.mailService.sendResetPasswordEmail({
    email: user.email,
    name: user.name,
    resetLink,
  });
}

async resetPassword(token: string, newPassword: string) {
  const user = await this.usersRepository.findOne({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
  throw new BadRequestException('Invalid or expired reset token');
}

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await this.usersRepository.save(user);
}

async resendVerificationEmail(email: string) {
  const user = await this.usersRepository.findOne({ where: { email } });

  if (!user) return; // don't reveal if email exists

  if (user.emailVerified) {
    throw new BadRequestException('Email is already verified');
  }

  const verifyToken = crypto.randomBytes(32).toString('hex');

  user.verifyToken = verifyToken;
  await this.usersRepository.save(user);

  await this.mailService.sendVerificationEmail({
    user: { name: user.name, email: user.email },
    verifyToken,
  });

  return { message: 'Verification email sent' };
}

async verifyEmail(token: string) {
  const user = await this.usersRepository.findOne({ where: { verifyToken: token } });

  if (!user) {
    throw new BadRequestException('Invalid verification token');
  }

  user.emailVerified = new Date();
  user.verifyToken = null;

  await this.usersRepository.save(user);

  return { message: 'Email verified successfully' };
}

async updatePassword(
  email: string,
  dto: UpdatePasswordDto,
): Promise<{ message: string }> {
  const user = await this.usersRepository.findOneBy({email});

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check current password
  const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isMatch) {
    throw new UnauthorizedException('Current password is incorrect');
  }

  // Prevent using same password
  const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
  if (isSamePassword) {
    throw new BadRequestException('New password must be different');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

  user.password = hashedPassword;

  await this.usersRepository.save(user);

  return { message: 'Password updated successfully' };
}


}