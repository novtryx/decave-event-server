// src/paystack/paystack.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { CreateTicketDto } from 'src/events/dto/create-event.dto';
import { AttendeesService } from './../attendees/attendees.service';
import { EventsService } from '../events/events.service';
import * as QRCode from 'qrcode';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class PaystackService {
  private secretKey = process.env.PAYSTACK_SECRET_KEY;
  private baseUrl = process.env.PAYSTACK_BASE_URL;

  constructor(
    private readonly attendeesService: AttendeesService, 
    private readonly eventService: EventsService,
    private readonly mailService: MailService
  ){}

  /** Initialize a payment and return Paystack authorization URL */
 async initializePaymentWithMetadata(
  ticketsMetadata: any[],
  email: string,
  amount: number,
) {
  const reference = `ref_${Date.now()}`;

  try {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        reference,
        metadata: { tickets: ticketsMetadata },
        callback_url: 'http://localhost:500/api', 
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      reference,
      authorization_url: response.data.data.authorization_url,
    };
  } catch (error: any) {
    throw new HttpException(
      error.response?.data?.message || 'Paystack initialization failed',
      HttpStatus.BAD_REQUEST,
    );
  }
}




async handleSuccessfulPayment(data: any) {
  console.log('Payment successful:', data);

  const tickets = data.metadata?.tickets;

  if (!tickets || tickets.length === 0) {
    console.warn('No ticket metadata found in webhook');
    return;
  }

  for (const item of tickets) {
    const ticket = await this.eventService.findByEventIdAndTicketId(
      item.eventId,
      item.ticketId,
    );

    if (!ticket) {
      console.warn(`Ticket not found: eventId=${item.eventId}, ticketId=${item.ticketId}`);
      continue;
    }

    const attendee = await this.attendeesService.create({
      name: item.name,
      email: item.email,
      phone: item.phone,
      ticketType: ticket.type,
      eventId: item.eventId,
      paystackId: data.reference,
      checkedIn: false,
      amount: ticket.price,
    });

    const qrData = JSON.stringify({ attendeeId: attendee.id, eventId: item.eventId });
    const qrCode = await QRCode.toDataURL(qrData);

    await this.attendeesService.update(attendee.id, { qrCode });

    const event = await this.eventService.findOne(item.eventId);
try {
  await this.mailService.sendTicketEmail({
    buyer: {
      fullName: item.name,
      email: item.email,
      phoneNumber: item.phone,
      ticketId: attendee.id,
      qrCode: Buffer.from(qrCode.split(',')[1], 'base64'),
    },
    event: {
      eventTitle: event.title,
      eventTheme: event.theme,
      startDate: event.eventDate,
      endDate: event.eventDate,
      venue: event.venue,
      address: event.address,
    },
    ticket: {
      ticketName: ticket.type,
    },
    transaction: {
      txnId: data.reference,
    },
  });
} catch (mailError) {
  console.error(`Failed to send ticket email to ${item.email}:`, mailError.message);
}
  }

  // Group tickets by ticketId and count each
  const ticketQtyMap = tickets.reduce((acc, item) => {
    acc[item.ticketId] = (acc[item.ticketId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Update qty for each ticket type
  await Promise.all(
    Object.entries(ticketQtyMap).map(([ticketId, qtySold]) =>
      this.eventService.updateTicketQty(tickets[0].eventId, { ticketId, qtySold: qtySold as number  }),
    ),
  );
}
  /** Handle a failed payment webhook */
  async handleFailedPayment(data: any) {
    console.log('Payment failed:', data);
    // TODO: Mark transaction failed in database
  }
}
