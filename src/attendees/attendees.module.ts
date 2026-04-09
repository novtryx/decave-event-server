import { Module } from '@nestjs/common';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendees } from './attendees.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Attendees])],
  controllers: [AttendeesController],
  providers: [AttendeesService, JwtStrategy],
  exports: [AttendeesService]
})
export class AttendeesModule {}
