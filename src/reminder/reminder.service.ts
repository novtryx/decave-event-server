import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendees } from '../attendees/attendees.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(Attendees)
    private readonly attendeesRepository: Repository<Attendees>,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 8 * * 1')
  async sendWeeklyReminders() {
    this.logger.log('Weekly reminder job started...');

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const attendees = await this.attendeesRepository
      .createQueryBuilder('attendee')
      .innerJoinAndSelect('attendee.event', 'event')
      .where('event.eventDate > :now', { now })
      .andWhere('event.eventDate <= :in30Days', { in30Days })
      .getMany();

    if (!attendees.length) {
      this.logger.log('No upcoming attendees found. Skipping.');
      return;
    }

    // Group attendees by eventId
    const byEvent = attendees.reduce<Record<number, Attendees[]>>(
      (acc, attendee) => {
        const key = attendee.eventId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(attendee);
        return acc;
      },
      {},
    );

    this.logger.log(
      `Found ${Object.keys(byEvent).length} event(s) with attendees. Sending grouped BCC emails...`,
    );

    const results = await Promise.allSettled(
      Object.values(byEvent).map((group) => {
        const event = group[0].event;
        const bccEmails = group.map((a) => a.email);

        const daysUntil = Math.ceil(
          (new Date(event.eventDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        this.logger.log(
          `Sending BCC reminder for "${event.title}" → ${bccEmails.length} attendee(s)`,
        );

        return this.mailService.sendReminderEmail({
          bccEmails,
          event: {
            title: event.title,
            eventDate: event.eventDate,
            venue: event.venue,
            address: event.address,
            banner: event.banner,
          },
          daysUntil,
        });
      }),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

    this.logger.log(
      `Done — ${succeeded} event batch(es) sent, ${failed.length} failed.`,
    );

    if (failed.length) {
      failed.forEach((f) => this.logger.error('Batch failed:', f.reason));
    }
  }
}