import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsletter, NewsletterSchema } from './schemas/newsletter.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendees } from '../attendees/attendees.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Newsletter.name, schema: NewsletterSchema },
    ]),
    TypeOrmModule.forFeature([Attendees]), // 👈 pull from MySQL
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService]
})
export class NewsletterModule {}
