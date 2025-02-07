// src/app/api/cron/route.ts
import { initializeServer } from '~/server/services/init'

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production') {
      await initializeServer();
    }
    
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    return new Response(JSON.stringify({ status: 'error', message: 'Initialization failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}