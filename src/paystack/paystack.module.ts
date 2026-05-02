// src/paystack/paystack.module.ts
import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { AttendeesModule } from '../attendees/attendees.module';
import { EventsModule } from '../events/events.module';
import { MailModule } from '../mail/mail.module';
import { VoteModule } from '../vote/vote.module';

@Module({
  imports: [AttendeesModule, EventsModule, MailModule, VoteModule],
  controllers: [PaystackController],
  providers: [PaystackService],
})
export class PaystackModule {}
