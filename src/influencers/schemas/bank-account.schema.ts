// bank-account.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BankAccount {
  @Prop({ required: true, trim: true })
  bankName!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 10,
  })
  accountNumber!: string;

  // From Paystack account resolution
  @Prop({ trim: true })
  accountName!: string;

  @Prop({ trim: true })
  bankCode!: string;

  @Prop({ default: false })
  verified!: boolean;
}

export const BankAccountSchema =
  SchemaFactory.createForClass(BankAccount);