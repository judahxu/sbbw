// src/app/api/cron/route.ts
import { useSession } from "next-auth/react";
import { exchangeRateJob } from '~/server/cron';

let isInitialized = false;

export async function GET() {
  // 检查session和权限
  const { data: session, status } = useSession();
  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isInitialized) {
    exchangeRateJob.start();
    isInitialized = true;
    return Response.json({ status: 'Cron jobs started' });
  }
  
  return Response.json({ status: 'Cron jobs already running' });
}