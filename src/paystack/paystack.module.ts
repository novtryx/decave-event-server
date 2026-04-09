// src/paystack/paystack.module.ts
import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { AttendeesModule } from '../attendees/attendees.module';
import { EventsModule } from '../events/events.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AttendeesModule, EventsModule, MailModule],
  controllers: [PaystackController],
  providers: [PaystackService],
})
export class PaystackModule {}
