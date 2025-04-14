import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json } from 'express';
import * as express from 'express'; // Add this import at the top
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Serve React static files
  app.useStaticAssets(join(__dirname, '..', 'scrape_frontend', 'build'));

  // This allows us to access raw body for webhook signature verification
  // Stripe Webhook Middleware
  app.use('/webhook/stripe', 
    express.raw({ 
      type: 'application/json',
      verify: (req: any, res, buf) => {
        console.log("inside the web hook middleware...");
        if (Buffer.isBuffer(buf)) {
          req.rawBody = buf;
        }
      },
      limit: '1mb'
    })  
  );

  app.use(json());

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
