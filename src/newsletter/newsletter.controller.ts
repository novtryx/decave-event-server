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
} 