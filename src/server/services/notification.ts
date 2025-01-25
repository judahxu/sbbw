// src/server/services/notification.ts
import { createTransport } from 'nodemailer';
import { env } from "~/env.js";

export class NotificationService {
  private readonly mailer = createTransport({
    // 配置邮件服务
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    // service: 'gmail',
    // auth: {
    //   type: 'OAuth2',
    //   user: 'your-email@gmail.com',
    //   clientId: 'YOUR_CLIENT_ID',
    //   clientSecret: 'YOUR_CLIENT_SECRET',
    //   refreshToken: 'YOUR_REFRESH_TOKEN',
    //   accessToken: 'YOUR_ACCESS_TOKEN',
    // },
  });
  

  async sendStatusChangeNotification(
    email: string,
    oldStatus: string,
    newStatus: string,
    expireAt?: Date
  ) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Plus账号状态变更通知',
      html: `
        <h2>您的Plus账号状态已更新</h2>
        <p>状态变更：${oldStatus} -> ${newStatus}</p>
        ${expireAt ? `<p>到期时间：${expireAt.toLocaleDateString()}</p>` : ''}
        ${newStatus === 'expiring' ? '<p>请注意及时续费以避免服务中断</p>' : ''}
      `,
    });
  }
}

// 更新PlusAccountService以集成通知
export class PlusAccountService {
  private readonly notificationService = new NotificationService();

  async updatePlusStatus(/*...*/) {
    // ... 现有的状态更新逻辑 ...

    if (newStatus !== account.plusStatus) {
      await this.db.transaction(async (trx) => {
        // ... 状态更新和历史记录 ...

        // 发送通知
        if (account.assignedEmail) {
          await this.notificationService.sendStatusChangeNotification(
            account.assignedEmail,
            account.plusStatus,
            newStatus,
            account.plusExpireAt
          );
        }
      });
    }
  }
}