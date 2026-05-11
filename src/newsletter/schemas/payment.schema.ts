// payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Attendee, AttendeeSchema } from './attendee.schema';
import { TicketInfo, TicketInfoSchema } from './ticket-info.schema';

export type PaymentDocument = Payment & Document;

@Schema({
  timestamps: true,
  collection: 'payments', // verify this matches your existing collection name
})
export class Payment {
  @Prop({ required: true, index: true })
  transactionReference: string;

  @Prop({ required: true, index: true })
  paymentReference: string;

  @Prop({ required: true })
  amountPaid: number;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  paidOn: Date;

  @Prop({ type: TicketInfoSchema })
  ticket: TicketInfo;

  @Prop({ type: [AttendeeSchema], default: [] })
  attendees: Attendee[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  raw: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Global unique index on attendee serials
PaymentSchema.index(
  { 'attendees.serial': 1 },
  {
    unique: true,
    partialFilterExpression: {
      'attendees.serial': { $exists: true, $type: 'string' },
    },
  },
);