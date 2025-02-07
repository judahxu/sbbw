// src/types/orders.ts

import type { 
  orders,
  rechargeOrders,
  appleIdOrders,
  accelerationOrders 
} from "~/server/db/schema";

// 从 schema 中提取基础类型
type BaseOrder = typeof orders.$inferSelect;
export type RechargeOrder = typeof rechargeOrders.$inferSelect;
export type AppleIdOrder = typeof appleIdOrders.$inferSelect;
export type AccelerationOrder = typeof accelerationOrders.$inferSelect;

// 完整订单类型（包含关联数据）
export interface Order extends BaseOrder {
  rechargeOrder?: RechargeOrder | null;
  appleIdOrder?: AppleIdOrder | null;
  accelerationOrder?: AccelerationOrder | null;
}