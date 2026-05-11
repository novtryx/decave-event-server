// transaction-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Buyer, BuyerSchema } from './buyer.schema';

export type TransactionHistoryDocument = TransactionHistory & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'transactionhistories', // must match existing collection name exactly
})
export class TransactionHistory {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  txnId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  })
  event: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  paystackId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    index: true,
  })
  ticket: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [BuyerSchema],
    required: true,
    validate: {
      validator: (v: Buyer[]) => v.length > 0,
      message: 'At least one buyer is required',
    },
  })
  buyers: Buyer[];

  @Prop({
    type: String,
    enum: ['pending', 'failed', 'completed'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'failed' | 'completed';
}

export const TransactionHistorySchema =
  SchemaFactory.createForClass(TransactionHistory);

// Indexes — mirrors your Express app exactly
TransactionHistorySchema.index({ txnId: 1 });
TransactionHistorySchema.index({ event: 1, status: 1 });
TransactionHistorySchema.index({ status: 1, createdAt: -1 });
TransactionHistorySchema.index({ 'buyers.email': 1 });

// Virtual
TransactionHistorySchema.virtual('checkedInCount').get(function () {
  return this.buyers.filter((b: Buyer) => b.checkedIn).length;
});