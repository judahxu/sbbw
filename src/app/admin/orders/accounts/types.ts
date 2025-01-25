// 订单状态类型
export type OrderStatus = 
  | 'pending_payment'
  | 'pending'
  | 'processing' 
  | 'completed'
  | 'failed'
  | 'cancelled';

// 分配状态类型
export type AllocationStatus =
  | 'pending'
  | 'completed'
  | 'failed';

// 支付状态类型
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// 支付方式类型
export type PaymentMethod =
  | 'alipay'
  | 'wechat'
  | 'transfer';

// 订单类型
export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  amountUsd: number;
  amountCny: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  allocationStatus: AllocationStatus;
  createdAt: string;
  updatedAt: string;
  paymentTime?: string;

  // 账号相关信息
  accountInfo?: {
    email: string;
    platform: 'chatgpt' | 'claude';
    type: 'permanent' | 'temporary';
    bundleType?: string;
  };

  // 服务配置
  serviceConfig?: {
    temporaryDays?: number;
    acceleratorDays?: number;
    plusMonths?: number;
  };

  // 处理信息
  processingInfo?: {
    operatorId?: string;
    operatorName?: string;
    note?: string;
    retryCount: number;
    lastProcessTime?: string;
  };
}

// 订单统计数据
export interface OrderStats {
  total: number;
  totalAmountUsd: number;
  totalAmountCny: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  pendingPayment: number;
}

// 订单过滤条件
export interface OrderFilters {
  search: string;
  status: string;
  dateRange: string;
  page: number;
  pageSize: number;
}

// 订单处理数据
export interface OrderProcessData {
  status: OrderStatus;
  note?: string;
  operator?: string;
  failureReason?: string;
}

// 账号分配数据
export interface AccountAllocationData {
  accountId: string;
  note?: string;
}

// 订单历史记录
export interface OrderHistory {
  id: string;
  orderId: string;
  action: string;
  content: string;
  operatorId?: string;
  operatorName?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}