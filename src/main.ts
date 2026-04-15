import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://decave-events.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  app.use( 
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production', // CSP on in prod, off in dev
  }),
);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strips unknown field
      forbidNonWhitelisted: true,
      transform: true,        // auto-transform types
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
 