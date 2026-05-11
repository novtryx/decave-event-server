// buyer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: true })
export class Buyer {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  })
  email: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true })
  ticketId: string;

  @Prop({ default: false })
  checkedIn: boolean;

  @Prop()
  qrCode?: string;
}

export const BuyerSchema = SchemaFactory.createForClass(Buyer);