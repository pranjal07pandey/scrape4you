import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json } from 'express';

import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Serve React static files
  app.useStaticAssets(join(__dirname, '..', 'scrape_frontend', 'build'));

  // This allows us to access raw body for webhook signature verification
  app.use('/webhook/stripe', json({ verify: (req: any, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString('utf8');
      }
  }}));

  app.use(json());

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
