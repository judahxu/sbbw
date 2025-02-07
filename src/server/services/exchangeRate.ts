// src/server/services/exchangeRate.ts
import { db } from "~/server/db";
import { configs } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface ExchangeRateResponse {
  success: boolean;
  rate?: number;
  error?: string;
}

// Type for the API response
interface ApiResponse {
  result: string;
  rates: {
    CNY: number;
    [key: string]: number;
  };
}

export async function fetchExchangeRate(): Promise<ExchangeRateResponse> {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = (await response.json()) as ApiResponse;
    
    // Type guard to check if the response has the expected structure
    if (!data || typeof data.rates?.CNY !== 'number') {
      throw new Error("Invalid API response format");
    }

    return { success: true, rate: data.rates.CNY };
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function updateExchangeRate(): Promise<boolean> {
  try {
    const { success, rate, error } = await fetchExchangeRate();
    
    if (!success || !rate) {
      console.error('Failed to update exchange rate:', error);
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
    console.error('Error updating exchange rate:', error);
    return false;
  }
}