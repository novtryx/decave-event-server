import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsletter, NewsletterSchema } from './schemas/newsletter.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendees } from '../attendees/attendees.entity';
import { TransactionHistory, TransactionHistorySchema } from './schemas/transaction-history.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Newsletter.name, schema: NewsletterSchema },
       {
        name: TransactionHistory.name,
        schema: TransactionHistorySchema,
      },
    ]),
     MongooseModule.forFeature(
      [{ name: Payment.name, schema: PaymentSchema }],
      'secondary', // 👈 targets your second DB connection
    ),
    TypeOrmModule.forFeature([Attendees]), // 👈 pull from MySQL
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
