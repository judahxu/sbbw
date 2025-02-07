// src/types/orders.ts

// 订单类型
export type OrderType = 'acceleration' | 'appleId' | 'recharge';

// 订单状态
export type OrderStatus = 
  | 'pending_payment'    // 待支付
  | 'paid'              // 已支付
  | 'processing'        // 处理中
  | 'completed'         // 已完成
  | 'failed'           // 失败
  | 'cancelled'        // 已取消
  | 'refunded';        // 已退款

// 基础订单接口
export interface BaseOrder {
  id: string;
  type: OrderType;
  userId: string;
  userEmail: string;
  amount: number;
  status: OrderStatus;
  createTime: string;
  updateTime: string;
  remark?: string;
}

// 加速服务订单
export interface AccelerationOrder extends BaseOrder {
  type: 'acceleration';
  plan: 'monthly' | 'quarterly' | 'yearly';
  configuration?: string;
}

// 美区账号订单
export interface AppleIdOrder extends BaseOrder {
  type: 'appleId';
  account?: {
    email: string;
    password: string;
  };
}

// 充值服务订单
export interface RechargeOrder extends BaseOrder {
  type: 'recharge';
  usdAmount: number;
  exchangeRate: number;
  giftCardCode?: string;
  appliedAccount: string;
}

// 统一订单类型
export type Order = AccelerationOrder | AppleIdOrder | RechargeOrder;

// 资源池状态
export interface ResourcePool {
  type: 'accelerator' | 'appleId';
  available: number;
  total: number;
  warning: boolean;
}

// 订单统计
export interface OrderStats {
  today: number;
  pending: number;
  monthlyIncome: number;
  // completionRate: number;
}