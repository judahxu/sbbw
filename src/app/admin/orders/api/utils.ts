// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwind 工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化数字
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '-';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

// 格式化货币 - USD
export function formatCurrencyUSD(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '-';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// 格式化货币 - CNY
export function formatCurrencyCNY(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '-';
  }
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// 格式化日期时间
export function formatDateTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) {
    return '-';
  }
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

// 格式化日期
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) {
    return '-';
  }
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

// 格式化时长
export function formatDuration(duration: string | undefined | null): string {
  if (!duration) {
    return '-';
  }

  const matches = duration.match(/(\d+)([mdy])/);
  if (!matches) {
    return duration;
  }

  const [, amount, unit] = matches;
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

// 生成 API Key
export function generateApiKey(): string {
  const prefix = 'sk-';
  const length = 32;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  
  for (let i = 0; i < length - prefix.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// 获取日期范围过滤条件
export function getDateRangeFilter(range: string): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now.setHours(23, 59, 59, 999));
  let from = new Date();

  switch (range) {
    case 'today':
      from.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      to.setDate(to.getDate() - 1);
      break;
    case '7days':
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      break;
    case '30days':
      from.setDate(from.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      break;
    case '90days':
      from.setDate(from.getDate() - 90);
      from.setHours(0, 0, 0, 0);
      break;
    default:
      from.setHours(0, 0, 0, 0);
  }

  return { from, to };
}

// 检查是否为外部链接
export function isExternalLink(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}

// 复制文本到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}