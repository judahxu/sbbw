// src/server/services/plus-account.ts
import type { DbType } from "~/server/db";
import { serviceAccounts, plusStatusHistory } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export class PlusAccountService {
  constructor(private readonly db: DbType) {}

  async updatePlusStatus(
    accountId: string,
    forceStatus?: 'active' | 'expiring' | 'renewal',
    reason?: string
  ) {
    const account = await this.db.query.serviceAccounts.findFirst({
      where: eq(serviceAccounts.id, accountId)
    });
    
    if (!account?.plusExpireAt) return;
    
    let newStatus: 'active' | 'expiring' | 'renewal';
    let changeReason = reason;
    
    if (forceStatus) {
      newStatus = forceStatus;
    } else {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (account.plusExpireAt <= now) {
        newStatus = 'renewal';
        changeReason = 'Subscription expired';
      } else if (account.plusExpireAt <= sevenDaysLater) {
        newStatus = 'expiring';
        changeReason = 'Approaching expiration';
      } else {
        newStatus = 'active';
        changeReason = 'Normal active status';
      }
    }
    
    // 只在状态发生变化时更新
    if (newStatus !== account.plusStatus) {
      await this.db.transaction(async (trx) => {
        await trx
          .update(serviceAccounts)
          .set({ plusStatus: newStatus })
          .where(eq(serviceAccounts.id, accountId));
          
        await trx
          .insert(plusStatusHistory)
          .values({
            accountId,
            oldStatus: account.plusStatus,
            newStatus,
            changeReason: changeReason || 'Status auto-update'
          });
      });
    }
    
    return newStatus;
  }

  // 其他Plus账号相关的方法...
}