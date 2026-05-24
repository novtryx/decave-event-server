// influencer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { WithdrawalHistory } from './withdrawal-history.schema';
import { BankAccount, BankAccountSchema } from './bank-account.schema';

export type InfluencerDocument = Influencer & Document;

@Schema({ timestamps: true })
export class Influencer {
  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  })
  email!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({
    type: BankAccountSchema,
    required: false,
    default: null,
  })
  bankAccount?: BankAccount;

  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  referralCode!: string;

  // Total number of buyers referred
  @Prop({ default: 0 })
  buyers!: number;

  // Wallet balance / earnings
  @Prop({ default: 0 })
  amount!: number;
 
 @Prop({type: String, default: null })
resetToken?: string | null;

@Prop({type: Date, default: null })
resetTokenExpiry?: Date | null;

  @Prop({ default: true })
  influencersTakesPercentage!: boolean;

  @Prop({
    default: 10,
    min: 0,
    max: 100,
  })
  percentage!: number;

}

export const InfluencerSchema =
  SchemaFactory.createForClass(Influencer);