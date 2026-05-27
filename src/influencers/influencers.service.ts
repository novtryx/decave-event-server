import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaystackService } from 'src/paystack/paystack.service';
import { Influencer, InfluencerDocument } from './schemas/influencer.schema';
import { Model } from 'mongoose';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { LoginInfluencerDto } from './dto/login-influencer.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UpdatePasswordDto } from 'src/users/dto/update-password.dto';
import { WithdrawalHistory, WithdrawalHistoryDocument } from './schemas/withdrawal-history.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InfluencersService {
    constructor(
        @InjectModel(Influencer.name)
    private influencerModel: Model<InfluencerDocument>,
    @InjectModel(WithdrawalHistory.name)
private readonly withdrawalModel: Model<WithdrawalHistoryDocument>,
      private readonly jwtService: JwtService,
    private readonly mailService: MailService,
        private readonly paystackService: PaystackService,
    ){}

   private generateReferralCode = (username: string): string => {
  // 1. Generate 2 random digits (10-99)
  const randomNumbers = Math.floor(10 + Math.random() * 90);

  // 2. Trim username to 8 chars if username + 2 digits would exceed 10
  const maxUsernameLength = 10 - String(randomNumbers).length; // always 8
  const trimmedUsername = username.slice(0, maxUsernameLength).toUpperCase();

  // 3. Combine: 2 digits at front + username (max 8 chars)
  return `${randomNumbers}${trimmedUsername}`;
};


    
async register(dto: CreateInfluencerDto): Promise<{ message: string }> {
    const existing = await this.influencerModel.findOne({
      email: dto.email,
    });
        const existinguser = await this.influencerModel.findOne({
      email: dto.username,
    });



    if (existing) throw new ConflictException('Email already in use');

    if (existinguser) throw new ConflictException('Username Already taken')

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const referralCode =
      this.generateReferralCode(dto.username);

    const influencer = new this.influencerModel({
      ...dto,
      password: hashedPassword,
      referralCode,
      buyers: 0,
      amount: 0,
      influencersTakesPercentage: dto.influencersTakesPercentage ?? false,
      percentage: dto.percentage ?? 10,
    });

    try {
      await influencer.save();

      try {
        await this.mailService.sendWelcomeEmail({
          user: {
            name: influencer.fullName,
            email: influencer.email,
          },
        });
      } catch (mailError: any) {
        console.error('Welcome email failed:', mailError.message);
      }

      return { message: 'Registration successful' };
    } catch (err) {
        console.log(err)
      throw new InternalServerErrorException('Could not create influencer');
    }
  }

  // ─── LOGIN ───────────────────────────────────────────────
  async login(dto: LoginInfluencerDto): Promise<{
    accessToken: string;
    influencer: any;
  }> {
    const influencer = await this.influencerModel.findOne({
      email: dto.email,
    });

    if (!influencer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      influencer.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: influencer._id,
      email: influencer.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...safeInfluencer } = influencer.toObject();

    return {
      accessToken,
      influencer: safeInfluencer,
    };
  }

  // ─── GET ALL ─────────────────────────────────────────────
  async findAll() {
    const influencers = await this.influencerModel.find();

    return influencers.map((i) => {
      const { password, ...rest } = i.toObject();
      return rest;
    });
  }

  // ─── GET ONE ─────────────────────────────────────────────
  async findOne(id: string) {
    const influencer = await this.influencerModel.findById(id);

    if (!influencer) {
      throw new NotFoundException(`Influencer not found`);
    }

    const { password, ...safe } = influencer.toObject();
    return safe;
  }

  // ─── UPDATE ─────────────────────────────────────────────
  async update(id: string, dto: any) {
    const influencer = await this.influencerModel.findById(id);

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (dto.email && dto.email !== influencer.email) {
      const emailTaken = await this.influencerModel.findOne({
        email: dto.email,
      });

      if (emailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(influencer, dto);

    const updated = await influencer.save();

    const { password, ...safe } = updated.toObject();
    return safe;
  }

  // ─── DELETE ─────────────────────────────────────────────
  async remove(id: string) {
    const influencer = await this.influencerModel.findById(id);

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    await influencer.deleteOne();

    return { message: 'Influencer deleted successfully' };
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────────
  async forgotPassword(email: string) {
    const influencer = await this.influencerModel.findOne({ email });

    if (!influencer) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 30);

    influencer.resetToken = token;
    influencer.resetTokenExpiry = expiry;

    await influencer.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailService.sendResetPasswordEmail({
      email: influencer.email,
      name: influencer.fullName,
      resetLink,
    });
  }

  // ─── RESET PASSWORD ─────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const influencer = await this.influencerModel.findOne({
      resetToken: token,
    });

    if (
      !influencer ||
      !influencer.resetTokenExpiry ||
      influencer.resetTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    influencer.password = await bcrypt.hash(newPassword, 10);
    influencer.resetToken = null;
    influencer.resetTokenExpiry = null;

    await influencer.save();
  }

  // ─── UPDATE PASSWORD ─────────────────────────────────────
  async updatePassword(email: string, dto: UpdatePasswordDto) {
    const influencer = await this.influencerModel.findOne({ email });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      influencer.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSame = await bcrypt.compare(
      dto.newPassword,
      influencer.password,
    );

    if (isSame) {
      throw new BadRequestException(
        'New password must be different',
      );
    }

    influencer.password = await bcrypt.hash(dto.newPassword, 10);

    await influencer.save();

    return { message: 'Password updated successfully' };
  }



  async saveBankAccount(
  influencerId: string,
  dto: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
  },
) {
  const influencer = await this.influencerModel.findById(influencerId);

  if (!influencer) {
    throw new NotFoundException('Influencer not found');
  }

  // 🔍 verify via Paystack
  const resolved = await this.paystackService.verifyBank(
    dto.accountNumber,
    dto.bankCode,
  );

  influencer.bankAccount = {
    bankName: dto.bankName,
    bankCode: dto.bankCode,
    accountNumber: dto.accountNumber,
    accountName: resolved.account_name,
    verified: true,
  };

  await influencer.save();

  return {
    message: 'Bank account verified and saved successfully',
    bankAccount: influencer.bankAccount,
  };
}


async getWithdrawals(
  influencerId: string,
  page = 1,
  limit = 20,
) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.withdrawalModel
      .find({ influencerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    this.withdrawalModel.countDocuments({ influencerId }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}



async requestWithdrawal(
  influencerId: string,
  dto: { amount: number },
) {
  const influencer = await this.influencerModel.findById(influencerId);

  if (!influencer) {
    throw new NotFoundException('Influencer not found');
  }

  // check bank account
  if (!influencer.bankAccount?.verified) {
    throw new BadRequestException(
      'Please add a verified bank account first',
    );
  }
 
  // check balance
  if (dto.amount > influencer.amount) {
    throw new BadRequestException('Insufficient balance');
  }

  // prevent multiple pending withdrawals
  const pending = await this.withdrawalModel.findOne({
    influencerId,
    status: 'pending',
  });

  if (pending) {
    throw new BadRequestException(
      'You already have a pending withdrawal',
    );
  }

  const token = uuidv4();

  const withdrawal = await this.withdrawalModel.create({
    influencerId,
    amount: dto.amount,
    status: 'pending',
    bankName: influencer.bankAccount.bankName,
    accountNumber: influencer.bankAccount.accountNumber,
    accountName: influencer.bankAccount.accountName,
    token,
  });

  return {
    message: 'Withdrawal request created',
    withdrawal,
  };
}


async updateWithdrawalStatus(
  withdrawalId: string,
  status: 'pending' | 'completed' | 'failed',
) {
  const withdrawal = await this.withdrawalModel.findById(withdrawalId);

  if (!withdrawal) {
    throw new NotFoundException('Withdrawal not found');
  }

  if (withdrawal.status === 'completed') {
    return { message: 'Already completed' };
  }

  withdrawal.status = status;
  await withdrawal.save();

  // if completed → deduct wallet balance
  if (status === 'completed') {
    await this.influencerModel.findByIdAndUpdate(
      withdrawal.influencerId,
      {
        $inc: { amount: -withdrawal.amount },
      },
    );
  }

  return {
    message: `Withdrawal marked as ${status}`,
  };
}



async getTransactionHistory(
  influencerId: string,
  page = 1,
  limit = 20,
) {
  const skip = (page - 1) * limit;

  const [data, total, aggregation] = await Promise.all([
    this.withdrawalModel
      .find({ influencerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    this.withdrawalModel.countDocuments({ influencerId }),

    this.withdrawalModel.aggregate([
      { $match: { influencerId } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Shape aggregation results into a readable summary
  const summary = {
    totalWithdrawn: 0,
    totalPending: 0,
    totalFailed: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  };

  for (const group of aggregation) {
    if (group._id === 'completed') {
      summary.totalWithdrawn = group.totalAmount;
      summary.completedCount = group.count;
    } else if (group._id === 'pending') {
      summary.totalPending = group.totalAmount;
      summary.pendingCount = group.count;
    } else if (group._id === 'failed') {
      summary.totalFailed = group.totalAmount;
      summary.failedCount = group.count;
    }
  }

  return {
    data,
    summary,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

}
