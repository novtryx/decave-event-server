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
          synchronize: false, // ⚠️ dev only
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

  ],
  controllers: [AppController],
  providers: [AppService, PaystackService, CloudinaryService],
})
export class AppModule {}
