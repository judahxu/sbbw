// src/server/cron/index.ts
import { CronJob } from 'cron';
import { updateExchangeRate } from '../services/exchangeRate';

// 每天北京时间早上5点更新汇率
export const exchangeRateJob = new CronJob(
  '1 * * * *', // cron表达式：分 时 日 月 周
  async () => {
    const success = await updateExchangeRate();
  },
  null, // onComplete
  false, // start
  'Asia/Shanghai' // 时区
);