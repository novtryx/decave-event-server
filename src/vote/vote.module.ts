import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Vote } from './vote.entity';
import { VoteVisit } from './voteVisits.entity';
import { MailModule } from 'src/mail/mail.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports:[
    TypeOrmModule.forFeature([User, Vote, VoteVisit ]),
    MailModule
  ],
  providers: [VoteService, JwtStrategy],
  controllers: [VoteController],
  exports:[VoteService]
})
export class VoteModule {}
