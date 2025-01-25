import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, startOfDay, endOfDay, subDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成API Key
 * 格式: sk-xxxxxxxxxxxxx (32位)
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const keyLength = 32;
  let result = 'sk-';
  
  for (let i = 0; i < keyLength - 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 获取日期范围过滤器
 */
export function getDateRangeFilter(range: string) {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return {
        from: startOfDay(now),
        to: endOfDay(now)
      };
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday)
      };
    }
    case '7days':
      return {
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now)
      };
    case '30days':
      return {
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now)
      };
    default:
      return null;
  }
}

/**
 * 格式化时长显示
 */
export function formatDuration(duration: string | null): string {
  if (!duration) return '-';
  
  const match = duration.match(/^(\d+)([mdy])$/);
  if (!match) return duration;

  const [, amount, unit] = match;
  switch (unit) {
    case 'd':
      return `${amount}天`;
    case 'm':
      return `${amount}个月`;
    case 'y':
      return `${amount}年`;
    default:
      return duration;
  }
}

/**
 * 格式化金额显示
 */
export function formatCurrency(amount: number, currency: 'USD' | 'CNY' = 'CNY'): string {
  return currency === 'CNY' 
    ? `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` 
    : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | string | null, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  if (!date) return '-';
  return format(new Date(date), formatStr);
}

/**
 * Token数量格式化
 */
export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * 生成订单号
 */
export function generateOrderNumber(type: 'account' | 'accelerator' | 'api' | 'plus_recharge'): string {
  const prefix = {
    account: 'ACC',
    accelerator: 'SPD',
    api: 'API',
    plus_recharge: 'PLUS'
  }[type];

  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}${date}${random}`;
}

/**
 * 计算到期时间
 */
export function calculateExpireDate(duration: string, startDate: Date = new Date()): Date {
  const match = duration.match(/^(\d+)([mdy])$/);
  if (!match) throw new Error('Invalid duration format');

  const [, amount, unit] = match;
  const value = parseInt(amount);
  
  const date = new Date(startDate);
  switch (unit) {
    case 'd':
      date.setDate(date.getDate() + value);
      break;
    case 'm':
      date.setMonth(date.getMonth() + value);
      break;
    case 'y':
      date.setFullYear(date.getFullYear() + value);
      break;
  }
  
  return date;
}

/**
 * 获取订单状态配置
 */
export const ORDER_STATUS = {
  pending: {
    label: '待处理',
    color: 'yellow',
    textColor: 'yellow-800',
    bgColor: 'yellow-100'
  },
  processing: {
    label: '处理中',
    color: 'blue',
    textColor: 'blue-800',
    bgColor: 'blue-100'
  },
  completed: {
    label: '已完成',
    color: 'green',
    textColor: 'green-800',
    bgColor: 'green-100'
  },
  failed: {
    label: '已失败',
    color: 'red',
    textColor: 'red-800',
    bgColor: 'red-100'
  },
  cancelled: {
    label: '已取消',
    color: 'gray',
    textColor: 'gray-800',
    bgColor: 'gray-100'
  }
} as const;

/**
 * 获取支付状态配置
 */
export const PAYMENT_STATUS = {
  pending: {
    label: '待支付',
    color: 'yellow',
    textColor: 'yellow-800',
    bgColor: 'yellow-100'
  },
  paid: {
    label: '已支付',
    color: 'green',
    textColor: 'green-800',
    bgColor: 'green-100'
  },
  failed: {
    label: '支付失败',
    color: 'red',
    textColor: 'red-800',
    bgColor: 'red-100'
  },
  refunded: {
    label: '已退款',
    color: 'gray',
    textColor: 'gray-800',
    bgColor: 'gray-100'
  }
} as const;

/**
 * 错误处理工具
 */
export function handleError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '操作失败';
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 表单值转换工具
 */
export function parseFormValue<T>(value: unknown, defaultValue: T): T {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string' && value.trim() === '') return defaultValue;
  return value as T;
}



