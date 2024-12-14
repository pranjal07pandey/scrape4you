import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Serve React static files
  app.useStaticAssets(join(__dirname, '..', 'scrape_frontend', 'build'));

  // Catch-all route for React
  // app.get('*', (req, res) => {
  //   res.sendFile(join(__dirname, '..', 'scrape_frontend', 'build', 'index.html'));
  // });

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
