// src/server/services/exchangeRate.ts
import { db } from "~/server/db";
import { configs } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface ExchangeRateResponse {
  success: boolean;
  rate?: number;
  error?: string;
}

export async function fetchExchangeRate(): Promise<ExchangeRateResponse> {
  try {
    // 使用 ExchangeRate-API 的免费API (你需要注册获取API key)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rates.CNY;
    
    if (!rate) {
      throw new Error("Could not find CNY rate in response");
    }

    return { success: true, rate };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateExchangeRate(): Promise<boolean> {
  try {
    const { success, rate, error } = await fetchExchangeRate();
    
    if (!success || !rate) {
      return false;
    }

    // 更新数据库
    await db.update(configs)
      .set({
        exchange_rate: rate.toString(),
        updated_at: new Date(),
        updated_by: 'system'
      })
      .where(eq(configs.type, 'exchange_rate'));

    return true;
  } catch (error) {
    return false;
  }
}