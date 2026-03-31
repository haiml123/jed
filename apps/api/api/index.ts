import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

const expressApp = express();
let appInitialized = false;

async function bootstrap() {
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  await app.init();
  appInitialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!appInitialized) {
    await bootstrap();
  }
  expressApp(req, res);
}
