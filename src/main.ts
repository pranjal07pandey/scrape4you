import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json } from 'express';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
dotenv.config();

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase initialized successfully for project:', serviceAccount.project_id);
  } catch (e) {
    console.error('Firebase initialization failed:', e.message);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: ['https://busymotorsltd.co.uk', 'https://www.busymotorsltd.co.uk', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Log every incoming API request
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[${req.method}] ${req.url} → ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });

  // Serve React static files
  app.useStaticAssets(join(__dirname, '..', 'scrape_frontend', 'build'));

  app.use(json());

  await app.listen(process.env.PORT || 5001);
}
bootstrap();
