// src/server/workers/plus-status.ts
import { CronJob } from 'cron';
// import { PlusAccountService } from '../services/plus-account';
import { db } from '../db';
// import { serviceAccounts } from '../db/schema';
import { and, sql } from 'drizzle-orm';

export function setupPlusStatusWorker() {
  // 每天凌晨检查所有账号状态
  const dailyJob = new CronJob('0 0 * * *', async () => {
    // const service = new PlusAccountService(db);
    
    // const accounts = await db.query.serviceAccounts.findMany({
    //   where: sql`plus_duration IS NOT NULL`,
    // });
    
    // for (const account of accounts) {
    //   await service.updatePlusStatus(account.id);
    // }
  });

  // 每小时检查即将到期的账号
  const hourlyJob = new CronJob('0 * * * *', async () => {
    // const service = new PlusAccountService(db);
    
    // const expiringAccounts = await db.query.serviceAccounts.findMany({
    //   where: and(
    //     sql`plus_duration IS NOT NULL`,
    //     sql`plus_expire_at <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    //   )
    // });
    
    // for (const account of expiringAccounts) {
    //   await service.updatePlusStatus(account.id);
    // }
  });

  dailyJob.start();
  hourlyJob.start();
}