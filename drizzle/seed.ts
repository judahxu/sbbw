// drizzle/seed.ts
import { db } from "../src/server/db";
import { configs } from "../src/server/db/schema";
import crypto from "crypto";

async function seed() {
  const defaultConfigs = [
    // 加速服务配置
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
  ];

  console.log('🌱 开始插入默认配置...');
  
  try {
    for (const config of defaultConfigs) {
      await db.insert(configs).values(config);
    }
    console.log('✅ 默认配置插入成功');
  } catch (error) {
    console.error('❌ 插入默认配置失败:', error);
    throw error;
  }
}

// 执行seed
seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    // 如果使用的是需要关闭连接的数据库（比如PostgreSQL），在这里关闭
    // await db.end();
    process.exit(0);
  });