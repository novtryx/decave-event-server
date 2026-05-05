import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AttendeesModule } from './attendees/attendees.module';
import { PaystackService } from './paystack/paystack.service';
import { PaystackModule } from './paystack/paystack.module';
import { MailModule } from './mail/mail.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { PayoutsModule } from './payouts/payouts.module';
import { VoteModule } from './vote/vote.module';
import { ReminderModule } from './reminder/reminder.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterModule } from './newsletter/newsletter.module';



@Module({
  imports: [

     ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT') || 3306,
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false, 
        }),
      }), 
       MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
      

    UsersModule,

    EventsModule,

    AttendeesModule,

    PaystackModule,

    MailModule,

    CloudinaryModule,

    UploadModule,

    PayoutsModule,

    VoteModule,

    ReminderModule,

    NewsletterModule,

  ],
  controllers: [AppController],
  providers: [AppService, PaystackService, CloudinaryService],
})
export class AppModule {}
