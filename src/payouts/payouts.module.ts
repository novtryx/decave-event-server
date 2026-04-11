import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { MailModule } from 'src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Attendees } from 'src/attendees/attendees.entity';

@Module({
  providers: [PayoutsService],
  controllers: [PayoutsController],
    imports: [
    TypeOrmModule.forFeature([Withdrawal, BankAccount, Attendees]), // 👈 make sure all three are here
    MailModule,
  ],

})
export class PayoutsModule {}
