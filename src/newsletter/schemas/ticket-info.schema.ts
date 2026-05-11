// ticket-info.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class TicketInfo {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  seats: number;
}

export const TicketInfoSchema = SchemaFactory.createForClass(TicketInfo);