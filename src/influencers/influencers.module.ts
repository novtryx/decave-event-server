import { Module } from '@nestjs/common';
import { InfluencersService } from './influencers.service';
import { InfluencersController } from './influencers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Influencer, InfluencerSchema } from './schemas/influencer.schema';
import { WithdrawalHistory, WithdrawalHistorySchema } from './schemas/withdrawal-history.schema';
import { BankAccount, BankAccountSchema } from './schemas/bank-account.schema';
import { PaystackModule } from 'src/paystack/paystack.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfluencerJwtStrategy } from 'src/auth/influencer-jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    PaystackModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '2d' },
          }),
        }),
    MongooseModule.forFeature([
      {
        name: Influencer.name,
        schema: InfluencerSchema,
      },
      {
        name: WithdrawalHistory.name,
        schema: WithdrawalHistorySchema,
      },
      {
        name: BankAccount.name,
        schema: BankAccountSchema,
      },
    ]),
    
  ],
  providers: [InfluencersService, InfluencerJwtStrategy],
  controllers: [InfluencersController]
})
export class InfluencersModule {}
