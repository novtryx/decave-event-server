// newsletter/newsletter.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import { Attendees } from '../attendees/attendees.entity';
import { TransactionHistory, TransactionHistoryDocument } from './schemas/transaction-history.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectModel(TransactionHistory.name)
    private transactionModel: Model<TransactionHistoryDocument>,

    @InjectModel(Payment.name, 'secondary') // 👈 second DB
  private paymentModel: Model<PaymentDocument>,

     @InjectModel(Newsletter.name)
    private newsletterModel: Model<NewsletterDocument>,

    @InjectRepository(Attendees) 
    private attendeesRepository: Repository<Attendees>,
  ) {}

  async transferAttendeesToNewsletter(): Promise<{
    added: number;
    skipped: number;
    total: number;
  }> {
    // 1. Get all unique emails from attendees (MySQL)
    const attendees = await this.attendeesRepository
      .createQueryBuilder('attendee')
      .select('DISTINCT attendee.email', 'email')
      .getRawMany<{ email: string }>();

    const attendeeEmails = attendees.map((a) => a.email.toLowerCase().trim());

    if (!attendeeEmails.length) {
      return { added: 0, skipped: 0, total: 0 };
    }

    // 2. Find which emails already exist in MongoDB newsletter
    const existing = await this.newsletterModel
      .find({ email: { $in: attendeeEmails } })
      .select('email')
      .lean();

    const existingSet = new Set(existing.map((e) => e.email));

    // 3. Filter to only new emails
    const newEmails = attendeeEmails.filter((email) => !existingSet.has(email));

    // 4. Bulk insert new emails
    if (newEmails.length > 0) {
      await this.newsletterModel.insertMany(
        newEmails.map((email) => ({ email })),
        { ordered: false }, // 👈 continues on duplicate key errors
      );
    }

    this.logger.log(
      `Newsletter transfer: ${newEmails.length} added, ${existingSet.size} skipped`,
    );

    return {
      added: newEmails.length,
      skipped: existingSet.size,
      total: attendeeEmails.length,
    };
  }

  // in newsletter.service.ts — add this method
async syncBuyersFromTransactions(): Promise<{
  added: number;
  skipped: number;
  total: number;
}> {
  // 1. Pull all buyer emails from TransactionHistory (completed transactions only)
  const transactions = await this.transactionModel
    .find({ status: 'completed' })
    .select('buyers.email')
    .lean();

  const allEmails = transactions
    .flatMap((t) => t.buyers.map((b) => b.email))
    .map((e) => e.toLowerCase().trim());

  const uniqueEmails = [...new Set(allEmails)];

  if (!uniqueEmails.length) {
    return { added: 0, skipped: 0, total: 0 };
  }

  // 2. Find which already exist in newsletter
  const existing = await this.newsletterModel
    .find({ email: { $in: uniqueEmails } })
    .select('email')
    .lean();

  const existingSet = new Set(existing.map((e) => e.email));

  // 3. Filter to only new emails
  const newEmails = uniqueEmails.filter((email) => !existingSet.has(email));

  // 4. Bulk insert
  if (newEmails.length > 0) {
    await this.newsletterModel.insertMany(
      newEmails.map((email) => ({ email })),
      { ordered: false },
    );
  }

  this.logger.log(
    `Buyer sync: ${newEmails.length} added, ${existingSet.size} skipped`,
  );

  return {
    added: newEmails.length,
    skipped: existingSet.size,
    total: uniqueEmails.length,
  };
}

async syncPaymentAttendeesToNewsletter(): Promise<{
  added: number;
  skipped: number;
  total: number;
}> {
  // 1. Pull all attendee + customer emails from Payment collection (secondary DB)
  const payments = await this.paymentModel
    .find()
    .select('customerEmail attendees.email')
    .lean();

  const allEmails = payments.flatMap((p) => [
    p.customerEmail,
    ...p.attendees.map((a) => a.email),
  ]);

  const uniqueEmails = [
    ...new Set(
      allEmails
        .filter(Boolean) // drop empty strings / nulls
        .map((e) => e.toLowerCase().trim()),
    ),
  ];

  if (!uniqueEmails.length) {
    return { added: 0, skipped: 0, total: 0 };
  }

  // 2. Find which already exist in newsletter
  const existing = await this.newsletterModel
    .find({ email: { $in: uniqueEmails } })
    .select('email')
    .lean();

  const existingSet = new Set(existing.map((e) => e.email));

  // 3. Filter to only new emails
  const newEmails = uniqueEmails.filter((email) => !existingSet.has(email));

  // 4. Bulk insert
  if (newEmails.length > 0) {
    await this.newsletterModel.insertMany(
      newEmails.map((email) => ({ email })),
      { ordered: false },
    );
  }

  this.logger.log(
    `Payment attendee sync: ${newEmails.length} added, ${existingSet.size} skipped`,
  );

  return {
    added: newEmails.length,
    skipped: existingSet.size,
    total: uniqueEmails.length,
  };
}


async autoSubscribeEmail(email: string): Promise<void> {
  if (!email) return;

  const normalized = email.toLowerCase().trim();

  try {
    const exists = await this.newsletterModel
      .findOne({ email: normalized })
      .lean();

    if (!exists) {
      await this.newsletterModel.create({ email: normalized });
      this.logger.log(`Auto-subscribed ${normalized} to newsletter`);
    }
  } catch (err) {
    // never let this break the payment flow
    this.logger.error(`Failed to auto-subscribe ${normalized}:`, err);
  }
}
}