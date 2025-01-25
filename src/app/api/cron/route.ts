// src/app/api/cron/route.ts
import { exchangeRateJob } from '~/server/cron';

let isInitialized = false;

export async function GET() {
  if (!isInitialized) {
    exchangeRateJob.start();
    isInitialized = true;
    return Response.json({ status: 'Cron jobs started' });
  }
  
  return Response.json({ status: 'Cron jobs already running' });
}