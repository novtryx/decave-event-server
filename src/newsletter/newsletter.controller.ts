// newsletter/newsletter.controller.ts
import { Controller, Post } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('transfer')
  async transfer() {
    const result = await this.newsletterService.transferAttendeesToNewsletter();
    return {
      message: 'Transfer complete',
      ...result,
    };
  } 

  @Post('sync-buyers')
  async syncBuyers() {
    const result = await this.newsletterService.syncBuyersFromTransactions();
    return {
      message: 'Transfer complete',
      ...result,
    };
  } 
  @Post('sync-payment-attendees')
async syncPaymentAttendees() {
  const result = await this.newsletterService.syncPaymentAttendeesToNewsletter();
  return {
    message: 'Payment attendee emails synced to newsletter',
    ...result,
  };
}
} 