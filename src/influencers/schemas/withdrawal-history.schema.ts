import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WithdrawalHistoryDocument = WithdrawalHistory & Document;

@Schema({ timestamps: true })
export class WithdrawalHistory {
  @Prop({ required: true })
    influencerId!: string;

  @Prop({ required: true })
    amount!: number;

  @Prop({
        default: 'pending',
        enum: ['pending', 'completed', 'failed'],
    })
    status!: string;

  @Prop()
    bankName!: string;

  @Prop()
    accountNumber!: string;

  @Prop()
    accountName!: string;

  @Prop()
  token?: string;
}

export const WithdrawalHistorySchema =
  SchemaFactory.createForClass(WithdrawalHistory); 