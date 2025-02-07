// src/server/workers/plus-status.ts
import { CronJob } from 'cron';
import { db } from '../db';
import { serverAccounts, users } from '../db/schema';
import { and, eq, lte, gte, sql } from 'drizzle-orm';
import { sendExpirationNoticeEmail } from '../services/email';
import { exchangeRateJob } from '~/server/cron';

export function setupPlusStatusWorker() {
  const dailyCheckJob = new CronJob('0 1 * * *', async () => {
    try {
      console.log('开始检查加速服务到期状态...');
      
      // 查找7天内即将到期的账号
      const expiringAccounts = await db.query.serverAccounts.findMany({
        where: and(
          eq(serverAccounts.status, 'assigned'),
          gte(serverAccounts.assignmentEnd, new Date()),
          lte(serverAccounts.assignmentEnd, sql`DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY)`)
        ),
        // 确保包含用户信息的查询
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      console.log(`找到 ${expiringAccounts.length} 个即将到期的账号`);

      // 处理每个即将到期的账号
      for (const account of expiringAccounts) {
        try {
          const userData = account.user;
          if (!userData || !account.assignmentEnd) continue;

          // 计算剩余天数
          const now = new Date();
          const expirationDate = new Date(account.assignmentEnd);
          const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // 发送提醒邮件
          await sendExpirationNoticeEmail(userData.email, {
            username: userData.name ?? userData.email,
            expirationDate,
            daysRemaining,
            serviceType: '加速服务',
            renewalLink: `${process.env.NEXT_PUBLIC_APP_URL}/product`
          });

          console.log(`已发送到期提醒邮件到 ${userData.email}`);

          // 更新最后提醒时间
          await db.update(serverAccounts)
            .set({
              updatedAt: new Date()
            })
            .where(eq(serverAccounts.id, account.id));

        } catch (error) {
          console.error(`处理账号 ${account.id} 时出错:`, error);
          continue;
        }
      }

      console.log('加速服务到期状态检查完成');
    } catch (error) {
      console.error('加速服务状态检查任务失败:', error);
    }
  }, null, true, 'Asia/Shanghai');

  dailyCheckJob.start();
  exchangeRateJob.start();
  console.log('加速服务状态检查定时任务已启动');
}