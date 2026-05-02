// src/paystack/paystack.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { AttendeesService } from './../attendees/attendees.service';
import { EventsService } from '../events/events.service';
import { VoteService } from '../vote/vote.service'
import * as QRCode from 'qrcode';
import { MailService } from 'src/mail/mail.service';

type PaymentType = 'event' | 'voting';

// ── Metadata shapes ────────────────────────────────────────────────────────────

interface EventTicketMetadata {
  type?: 'event'; // default
  eventId: number;
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  howDidYouHearAboutUs?: string;
}

interface VoteMetadata {
  type: 'voting';
  competitionId: string;
  contestantId: string;
  qty: number;
  voterEmail: string;
  voterName: string;
  orgPays: boolean;
}

type PaymentMetadataItem = EventTicketMetadata | VoteMetadata;

@Injectable()
export class PaystackService {
  private secretKey = process.env.PAYSTACK_SECRET_KEY;
  private baseUrl = process.env.PAYSTACK_BASE_URL;

  constructor(
    private readonly attendeesService: AttendeesService,
    private readonly eventService: EventsService,
    private readonly votingService: VoteService,
    private readonly mailService: MailService,
  ) {}

  // ── Initialize ──────────────────────────────────────────────────────────────

 async initializePaymentWithMetadata(
  metadata: PaymentMetadataItem[] | VoteMetadata, // array for events, single object for voting
  email: string,
  amount: number,
  type: PaymentType = 'event',
) {
  const reference = `ref_${Date.now()}`;

  const callbackUrl =
    type === 'voting'
      ? `https://decavemgt.com`
      : `${process.env.FRONTEND_URL}/events/verify`;

  try {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        reference,
        metadata: {
          type,
          // events → tickets array, voting → single vote object
          ...(type === 'voting'
            ? { vote: metadata }
            : { tickets: metadata }),
        },
        callback_url: callbackUrl,
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

  // ── Webhook router ──────────────────────────────────────────────────────────

  async handleSuccessfulPayment(data: any) {
    console.log('Payment successful:', data);

    const type: PaymentType = data.metadata?.type ?? 'event';

    if (type === 'voting') {
      return this.handleSuccessfulVotePayment(data);
    }

    return this.handleSuccessfulEventPayment(data);
  }

  async handleFailedPayment(data: any) {
    console.log('Payment failed:', data);
    // TODO: mark transaction failed
  }

  // ── Event handler (your original logic, untouched) ──────────────────────────

  private async handleSuccessfulEventPayment(data: any) {
    let tickets = data.metadata?.tickets;

    if (!tickets) {
      console.warn('No ticket metadata found in webhook');
      return;
    }

    if (typeof tickets === 'string') {
      try {
        tickets = JSON.parse(tickets);
      } catch (err) {
        console.error('Failed to parse tickets metadata:', err);
        return;
      }
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      console.warn('Tickets metadata is not a valid array');
      return;
    }

    const eventId = Number(tickets[0]?.eventId);
    if (isNaN(eventId)) {
      throw new Error('Invalid eventId in tickets metadata');
    }

    console.log(tickets);
    console.log('eventId==', eventId);

    await Promise.allSettled(
      tickets.map(async (item: EventTicketMetadata) => {
        const itemEventId = Number(item.eventId);

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
            location: item.location,
            howDidYouHearAboutUs: item.howDidYouHearAboutUs,
          });

          const qrData = JSON.stringify({
            attendeeId: attendee.id,
            eventId: item.eventId,
          });
          const qrCode = await QRCode.toDataURL(qrData);
          await this.attendeesService.update(attendee.id, { qrCode });

          const event = await this.eventService.findOneById(item.eventId);

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
              ticket: { ticketName: ticket.type },
              transaction: { txnId: data.reference },
            });
          } catch (mailError) {
            console.error(`Failed to send email to ${item.email}:`, mailError);
          }

          return attendee;
        } catch (err) {
          console.error('Error processing ticket item:', item, err);
          return null;
        }
      }),
    );

    // Update sold quantities
    const ticketQtyMap = tickets.reduce(
      (acc: Record<string, number>, item: EventTicketMetadata) => {
        acc[item.ticketId] = (acc[item.ticketId] || 0) + 1;
        return acc;
      },
      {},
    );

    await Promise.all(
      Object.entries(ticketQtyMap).map(([ticketId, qtySold]) =>
        this.eventService.updateTicketQty(Number(eventId), {
          ticketId,
          qtySold: qtySold as number,
        }),
      ),
    );

    console.log('Event payment processing completed');
  }

  // ── Voting handler ──────────────────────────────────────────────────────────

private async handleSuccessfulVotePayment(data: any) {
  const item: VoteMetadata = data.metadata?.vote;

  if (!item) {
    console.warn('No vote metadata found in webhook');
    return;
  }

  try {
    await this.votingService.castVote(
      item.competitionId,
      { contestantId: item.contestantId, voteCount: item.qty },
    );

    console.log(`Recorded ${item.qty} vote(s) for contestant ${item.contestantId}`);

    // try {
    //   await this.mailService.sendVoteConfirmationEmail({
    //     voterName: item.voterName,
    //     voterEmail: item.voterEmail,
    //     contestantId: item.contestantId,
    //     competitionId: item.competitionId,
    //     qty: item.qty,
    //     reference: data.reference,
    //   });
    // } catch (mailError) {
    //   console.error(`Failed to send vote confirmation to ${item.voterEmail}:`, mailError);
    // }
  } catch (err) {
    console.error('Error processing vote payment:', err);
  }

  console.log('Vote payment processing completed');
}
}