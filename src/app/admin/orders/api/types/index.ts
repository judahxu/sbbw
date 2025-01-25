// types/index.ts
export interface APIOrder {
  id: string;
  orderNumber: string;
  customer: string;
  type: 'token' | 'rental';
  spec: string;
  amountUsd: number;
  amountCny: number;
  apiKey: string;
  apiKeyStatus: 'active' | 'warning' | 'depleted';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  usage: {
    used?: number;
    total?: number;
    remainingDays?: number;
  };
}

export interface OrderStats {
  total: number;
  totalAmountUsd: number;
  totalAmountCny: number;
  processing: number;
  successRate: number;
  averageProcessTime: number;
}

export interface APIKeyOperation {
  orderId: string;
  reason?: string;
  newApiKey?: string;
  amount?: string;
  duration?: string;
}