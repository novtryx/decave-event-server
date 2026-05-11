// attendee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Attendee {
  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ required: true, index: true })
  serial: string;

  @Prop({ required: true })
  ticketName: string;
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);