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
        callback_url: 'http://localhost:3000/events/verify', 
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
  console.log("Payment successful:", data);

  let tickets = data.metadata?.tickets;

  // ✅ Ensure tickets is always an array
  if (!tickets) {
    console.warn("No ticket metadata found in webhook");
    return;
  }

  if (typeof tickets === "string") {
    try {
      tickets = JSON.parse(tickets);
    } catch (err) {
      console.error("Failed to parse tickets metadata:", err);
      return;
    }
  }

  if (!Array.isArray(tickets) || tickets.length === 0) {
    console.warn("Tickets metadata is not a valid array");
    return;
  }

  const eventId = Number(tickets[0]?.eventId);

if (isNaN(eventId)) {
  throw new Error("Invalid eventId in tickets metadata");
}
  // =========================
  // 1. PROCESS EACH TICKET
  // =========================

  console.log(tickets)
    console.log("eventis==",eventId)

  const results = await Promise.allSettled(
    tickets.map(async (item) => {
        const itemEventId = Number(item.eventId); // ✅ convert once per item

      try {
        const ticket = await this.eventService.findByEventIdAndTicketId(
          itemEventId,
          item.ticketId,
        );

        if (!ticket) {
          console.warn(
            `Ticket not found: eventId=${itemEventId}, ticketId=${item.ticketId}`,
          );
          return null;
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

        // QR generation
        const qrData = JSON.stringify({
          attendeeId: attendee.id,
          eventId: item.eventId,
        }); 

        const qrCode = await QRCode.toDataURL(qrData);

        await this.attendeesService.update(attendee.id, { qrCode });

        const event = await this.eventService.findOneById(item.eventId);

        // EMAIL (isolated so it never breaks loop)
        try {
          await this.mailService.sendTicketEmail({
            buyer: {
              fullName: item.name,
              email: item.email,
              phoneNumber: item.phone,
              ticketId: attendee.id,
              qrCode: Buffer.from(qrCode.split(",")[1], "base64"),
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
          console.error(
            `Failed to send email to ${item.email}:`,
            mailError,
          );
        }

        return attendee;
      } catch (err) {
        console.error("Error processing ticket item:", item, err);
        return null;
      }
    }),
  );

  // =========================
  // 2. UPDATE SOLD QUANTITY
  // =========================
  const ticketQtyMap = tickets.reduce((acc, item) => {
    acc[item.ticketId] = (acc[item.ticketId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  await Promise.all(
    Object.entries(ticketQtyMap).map(([ticketId, qtySold]) =>
      this.eventService.updateTicketQty(Number(eventId), {
        ticketId,
        qtySold: qtySold as number,
      }),
    ),
  );

  console.log("Payment processing completed successfully");
}

  /** Handle a failed payment webhook */
  async handleFailedPayment(data: any) {
    console.log('Payment failed:', data); 
    // TODO: Mark transaction failed in database
  }
}
