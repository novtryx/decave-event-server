import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/jwt.strategy';
import { User } from '../users/user.entity';
import { Event } from './event.entity';
import { Attendees } from '../attendees/attendees.entity';
import { MailModule } from 'src/mail/mail.module';
import { EventVisit } from './eventVisit.entity';

@Module({
  
  imports: [
    
    TypeOrmModule.forFeature([User, Event, Attendees, EventVisit]),
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2d' },
      }),
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, JwtStrategy],
  exports: [EventsService]
})
export class EventsModule {}
