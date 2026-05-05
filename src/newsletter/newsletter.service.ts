// newsletter/newsletter.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import { Attendees } from '../attendees/attendees.entity';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
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
}