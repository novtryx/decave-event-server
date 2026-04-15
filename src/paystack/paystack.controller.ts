// src/paystack/paystack.controller.ts
import { Controller, Post, Body, Headers, HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaystackService } from './paystack.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { EventsService } from '../events/events.service';
import { MinLength } from 'class-validator';
import { Ticket } from './../events/event.entity';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService, private readonly eventService: EventsService) {}

  /** Endpoint for client to start payment */
@Post('initialize')
async initialize(@Body() body: InitializePaymentDto[]) {
  if (!body || body.length === 0) {
    throw new BadRequestException('No tickets provided');
  }

  let totalAmount = 0;
  const ticketsMetadata: any = [];

  for (const item of body) {
    const ticket = await this.eventService.findByEventIdAndTicketId(
      item.eventId,
      item.ticketId,
    );

    if (!ticket) {
      throw new NotFoundException(
        `Ticket not found for eventId=${item.eventId}, ticketId=${item.ticketId}`,
      );
    }

    totalAmount += Number(ticket.price);

    ticketsMetadata.push({
      eventId: item.eventId,
      ticketId: item.ticketId,
      name: item.name,
      email: item.email,
      phone: item.phone,
      location: item.location,
      howDidYouHearAboutUs: item.howDidYouHearAboutUs,
      ticketType: ticket.type,
      amount: ticket.price,
    });
  }

  // ─── Fetch event to check organizerPays ──────────────────────
  const event = await this.eventService.findOneById(body[0].eventId);

  if (!event) {
    throw new NotFoundException(`Event not found`);
  }

  if (!event.organizerPays) {
    totalAmount = totalAmount * 1.065; // attendee bears 6% fee
  }

  const email = body[0].email;

  const payment = await this.paystackService.initializePaymentWithMetadata(
    ticketsMetadata,
    email,
    totalAmount,
  );

 return {
    totalAmount,
    payment,
  };
}

 

  @Post('webhook')
async handleWebhook(
  @Headers('x-paystack-signature') signature: string,
  @Body() body: any,
) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined');
  }

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  if (hash !== signature) {
    throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
  }

  // Handle event types
  const event = body.event;
  const data = body.data;

  switch (event) {
    case 'charge.success':
      await this.paystackService.handleSuccessfulPayment(data);
      break;
    case 'charge.failed':
      await this.paystackService.handleFailedPayment(data);
      break;
    default:
      console.log('Unhandled Paystack event:', event);
  }

  return { status: 'ok' };
}

}
