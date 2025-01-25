export interface PlusRechargeStats {
  total: number;
  processing: number;
  successRate: number;
  avgProcessTime: number;
  todayOrders: {
    count: number;
    amountUsd: number;
    amountCny: number;
  };
}

export interface PlusRechargeOrder {
  id: string;
  orderNumber: string;
  customer: string;
  contact: string;
  amountUsd: number;
  amountCny: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  account: {
    email: string;
    password: string;
  };
  subscription: string;
  operator: string | null;
  note: string;
  retryCount: number;
  history: OrderHistory[];
}

export interface OrderHistory {
  time: string;
  content: string;
  operator: string;
}