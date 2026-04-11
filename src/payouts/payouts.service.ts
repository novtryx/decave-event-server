import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Withdrawal } from './entities/withdrawal.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Attendees } from '../attendees/attendees.entity';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { SaveBankAccountDto } from './dto/save-bank-account.dto';
import { MailService } from '../mail/mail.service';
import { withdrawalRequestTemplate } from '../mail/template/withdrawal.mail';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepo: Repository<Withdrawal>,

    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,

    @InjectRepository(Attendees)
    private readonly attendeesRepo: Repository<Attendees>,

    private readonly mailService: MailService,
  ) {}

  // ─── Summary ────────────────────────────────────────────────────────────────

  async getSummary(userId: number) {
    // total revenue = sum of all ticket amounts across all user's events
    const revenueResult = await this.attendeesRepo
      .createQueryBuilder('attendee')
      .innerJoin('attendee.event', 'event')
      .where('event.userId = :userId', { userId })
      .select('SUM(attendee.amount)', 'total')
      .getRawOne();

    const totalRevenue = Number(revenueResult?.total ?? 0);

    // total withdrawn = sum of completed withdrawals only
    const withdrawnResult = await this.withdrawalRepo
      .createQueryBuilder('w')
      .where('w.userId = :userId', { userId })
      .andWhere('w.status = :status', { status: 'completed' })
      .select('SUM(w.amount)', 'total')
      .getRawOne();

    const totalWithdrawn = Number(withdrawnResult?.total ?? 0);
    const availableBalance = totalRevenue - totalWithdrawn;

    return {
      totalRevenue,
      totalWithdrawn,
      availableBalance,
    };
  }

  // ─── Withdrawal History ──────────────────────────────────────────────────────

  async getWithdrawals(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.withdrawalRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Request Withdrawal ──────────────────────────────────────────────────────

  async requestWithdrawal(userId: number, user: { name: string; email: string }, dto: CreateWithdrawalDto) {
    // check they have a bank account
    const bankAccount = await this.bankAccountRepo.findOne({ where: { userId } });
    if (!bankAccount) {
      throw new BadRequestException('Please add a bank account before requesting a withdrawal');
    }

    // check available balance
    const { availableBalance } = await this.getSummary(userId);
    if (dto.amount > availableBalance) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${availableBalance.toLocaleString('en-NG')}`,
      );
    }

    // check no pending withdrawal already exists
    const pendingExists = await this.withdrawalRepo.findOne({
      where: { userId, status: 'pending' },
    });
    if (pendingExists) {
      throw new BadRequestException(
        'You already have a pending withdrawal. Please wait for it to be completed.',
      );
    }

    // create withdrawal with magic token
    const token = uuidv4();
    const withdrawal = this.withdrawalRepo.create({
      userId,
      amount: dto.amount,
      status: 'pending',
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountName: bankAccount.accountName,
      token,
    });
    await this.withdrawalRepo.save(withdrawal);

    // send email to admin
    const approveLink = `${process.env.BACKEND_URL}/payouts/verify-withdrawal/${token}`;
    await this.mailService.sendVerifyWithdrawalEmail({
        user,
        amount: dto.amount,
        accountName: bankAccount.accountName,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        approveLink,
    });

    return { message: 'Withdrawal request submitted. Admin has been notified.' };
  }

  // ─── Verify Withdrawal (magic link) ─────────────────────────────────────────

  async verifyWithdrawal(token: string) {
    const withdrawal = await this.withdrawalRepo.findOne({ where: { token } });

    if (!withdrawal) {
      throw new NotFoundException('Invalid or already used withdrawal link');
    }

    if (withdrawal.status === 'completed') {
      return { message: 'This withdrawal has already been marked as completed.' };
    }

    withdrawal.status = 'completed';
    await this.withdrawalRepo.save(withdrawal);

    return { message: 'Withdrawal marked as completed successfully.' };
  }

  // ─── Bank Account ────────────────────────────────────────────────────────────


  async getBankAccount(userId: number) {
    const account = await this.bankAccountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No bank account found');
    return account;
  }

  async saveBankAccount(userId: number, dto: SaveBankAccountDto) {
    // resolve account from Paystack first
    const resolved = await this.resolveAccount(dto.accountNumber, dto.bankCode);

    const existing = await this.bankAccountRepo.findOne({ where: { userId } });

    if (existing) {
      // update existing
      Object.assign(existing, {
        bankName: dto.bankName,
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        accountName: resolved.account_name,
      });
      return this.bankAccountRepo.save(existing);
    }

    // create new
    const account = this.bankAccountRepo.create({
      userId,
      bankName: dto.bankName,
      bankCode: dto.bankCode,
      accountNumber: dto.accountNumber,
      accountName: resolved.account_name,
    });
    return this.bankAccountRepo.save(account);
  }

  async deleteBankAccount(userId: number) {
    const account = await this.getBankAccount(userId);
    await this.bankAccountRepo.remove(account);
    return { message: 'Bank account removed' };
  }

  // ─── Paystack Resolve ────────────────────────────────────────────────────────

  private async resolveAccount(accountNumber: string, bankCode: string) {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_LIVE_SECRET_KEY}`,
        },
      },
    );

    const data = await res.json();

    if (!data.status) {
      throw new BadRequestException(
        data.message ?? 'Could not resolve account. Please check the details.',
      );
    }

    return data.data as { account_name: string; account_number: string };
  }


  async getBanks() {
  const res = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_LIVE_SECRET_KEY}`,
    },
  });
  const data = await res.json();
  return data.data;
}

async resolveAccountPublic(accountNumber: string, bankCode: string) {
  return this.resolveAccount(accountNumber, bankCode);
}
}