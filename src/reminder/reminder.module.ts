import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { MailService } from 'src/mail/mail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendees } from 'src/attendees/attendees.entity';

@Module({
   imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Attendees]),
  ],
  providers: [ReminderService, MailService],
})
export class ReminderModule {}
