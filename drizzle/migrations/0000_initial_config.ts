// drizzle/migrations/0000_initial_config.ts
import { configs } from "../../src/server/db/schema";
import { sql } from "drizzle-orm";
import { mysqlTable } from 'drizzle-orm/mysql-core';

export async function up(db: any) {
  await db.insert(configs).values([
    {
      id: crypto.randomUUID(),
      type: 'acceleration',
      name: '加速服务月付',
      cycle: 'monthly',
      original_price: 49,
      current_price: 39,
      is_active: true,
      updated_by: 'system'
    },
    {
      id: crypto.randomUUID(),
      type: 'acceleration',
      name: '加速服务季付',
      cycle: 'quarterly',
      original_price: 147,
      current_price: 99,
      is_active: true,
      updated_by: 'system'
    },
    {
      id: crypto.randomUUID(),
      type: 'acceleration',
      name: '加速服务年付',
      cycle: 'yearly',
      original_price: 588,
      current_price: 328,
      is_active: true,
      updated_by: 'system'
    },

    // 美区账号配置
    {
      id: crypto.randomUUID(),
      type: 'appstore',
      name: '美区账号',
      cycle: 'once',
      original_price: 99,
      current_price: 99,
      is_active: true,
      updated_by: 'system'
    },

    // 汇率配置
    {
      id: crypto.randomUUID(),
      type: 'exchange_rate',
      name: '美元汇率',
      exchange_rate: 7.24,
      is_active: true,
      updated_by: 'system'
    },

    // 服务费配置
    {
      id: crypto.randomUUID(),
      type: 'service_fee',
      name: '充值服务费',
      fee_percentage: 5,
      minimum_fee: 1,
      maximum_fee: 100,
      is_active: true,
      updated_by: 'system'
    }
  ]);
}

export async function down(db: any) {
  await db.delete(configs).where(sql`type IN ('acceleration', 'appstore', 'exchange_rate', 'service_fee')`);
}