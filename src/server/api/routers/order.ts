// src/server/api/routers/order.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  orders, 
  accountOrders,
  acceleratorOrders,
  apiOrders,
  plusRechargeOrders,
  orderHistory
} from "~/server/db/schema";
import { and, eq, like, sql } from "drizzle-orm";

// 基础订单查询参数验证
const orderQuerySchema = z.object({
  type: z.enum(['account', 'accelerator', 'api', 'plus_recharge']).optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  }).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

export const orderRouter = createTRPCRouter({
  // 获取订单列表
  list: protectedProcedure
    .input(orderQuerySchema)
    .query(async ({ ctx, input }) => {
      const { type, status, paymentStatus, search, dateRange, page, pageSize } = input;
      
      const whereConditions = [];
      
      if (type) {
        whereConditions.push(eq(orders.type, type));
      }
      
      if (status) {
        whereConditions.push(eq(orders.orderStatus, status));
      }
      
      if (paymentStatus) {
        whereConditions.push(eq(orders.paymentStatus, paymentStatus));
      }
      
      if (search) {
        whereConditions.push(
          sql`(${orders.orderNumber} LIKE ${`%${search}%`} OR ${orders.userEmail} LIKE ${`%${search}%`})`
        );
      }
      
      if (dateRange) {
        whereConditions.push(
          sql`${orders.createdAt} BETWEEN ${dateRange.from} AND ${dateRange.to}`
        );
      }

      const items = await ctx.db.query.orders.findMany({
        where: and(...whereConditions),
        limit: pageSize,
        offset: (page - 1) * pageSize,
        with: {
          accountOrder: true,
          acceleratorOrder: true,
          apiOrder: true,
          plusRechargeOrder: true,
        },
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      });

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(...whereConditions));

      return {
        items,
        total: count,
        page,
        pageSize,
      };
    }),

  // 获取订单详情
  detail: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      type: z.enum(['account', 'accelerator', 'api', 'plus_recharge'])
    }))
    .query(async ({ ctx, input }) => {
      const { id, type } = input;

      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
          accountOrder: type === 'account',
          acceleratorOrder: type === 'accelerator',
          apiOrder: type === 'api',
          plusRechargeOrder: type === 'plus_recharge',
        }
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "订单不存在"
        });
      }

      // 获取订单历史
      const history = await ctx.db.query.orderHistory.findMany({
        where: eq(orderHistory.orderId, id),
        orderBy: (history, { desc }) => [desc(history.createdAt)],
      });

      return {
        ...order,
        history
      };
    }),

  // 更新订单状态
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
      note: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, note, metadata } = input;

      await ctx.db.transaction(async (tx) => {
        // 更新订单状态
        await tx.update(orders)
          .set({ 
            orderStatus: status,
            updatedAt: new Date()
          })
          .where(eq(orders.id, id));

        // 记录历史
        await tx.insert(orderHistory).values({
          orderId: id,
          action: 'update_status',
          content: `订单状态更新为: ${status}${note ? ` - ${note}` : ''}`,
          operatorId: ctx.session?.user?.id,
          operatorName: ctx.session?.user?.name,
          metadata
        });
      });

      return { success: true };
    }),

  // 获取订单统计
  getStats: protectedProcedure
    .input(z.object({
      type: z.enum(['account', 'accelerator', 'api', 'plus_recharge']).optional(),
      dateRange: z.object({
        from: z.date(),
        to: z.date()
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      const { type, dateRange } = input;
      
      const whereConditions = [];
      
      if (type) {
        whereConditions.push(eq(orders.type, type));
      }
      
      if (dateRange) {
        whereConditions.push(
          sql`${orders.createdAt} BETWEEN ${dateRange.from} AND ${dateRange.to}`
        );
      }

      const [stats] = await ctx.db
        .select({
          total: sql<number>`COUNT(*)`,
          totalAmountUsd: sql<number>`SUM(${orders.amountUsd})`,
          totalAmountCny: sql<number>`SUM(${orders.amountCny})`,
          pending: sql<number>`SUM(CASE WHEN ${orders.orderStatus} = 'pending' THEN 1 ELSE 0 END)`,
          processing: sql<number>`SUM(CASE WHEN ${orders.orderStatus} = 'processing' THEN 1 ELSE 0 END)`,
          completed: sql<number>`SUM(CASE WHEN ${orders.orderStatus} = 'completed' THEN 1 ELSE 0 END)`,
          failed: sql<number>`SUM(CASE WHEN ${orders.orderStatus} = 'failed' THEN 1 ELSE 0 END)`,
          pendingPayment: sql<number>`SUM(CASE WHEN ${orders.paymentStatus} = 'pending' THEN 1 ELSE 0 END)`,
          successRate: sql<number>`ROUND(
            SUM(CASE WHEN ${orders.orderStatus} = 'completed' THEN 1 ELSE 0 END) * 100.0 / 
            COUNT(*), 
            2
          )`
        })
        .from(orders)
        .where(and(...whereConditions));

      return stats;
    }),

  // 账号分配
  allocateAccount: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      accountId: z.string(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, accountId, metadata } = input;

      await ctx.db.transaction(async (tx) => {
        // 更新订单状态
        await tx.update(orders)
          .set({ 
            orderStatus: 'processing',
            updatedAt: new Date()
          })
          .where(eq(orders.id, orderId));

        // 更新账号订单分配状态
        await tx.update(accountOrders)
          .set({
            accountId,
            allocationStatus: 'completed'
          })
          .where(eq(accountOrders.orderId, orderId));

        // 记录历史
        await tx.insert(orderHistory).values({
          orderId,
          action: 'allocate_account',
          content: `分配账号: ${accountId}`,
          operatorId: ctx.session?.user?.id,
          operatorName: ctx.session?.user?.name,
          metadata
        });
      });

      return { success: true };
    }),

  // API Key操作
  resetApiKey: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      newApiKey: z.string(),
      reason: z.string(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, newApiKey, reason, metadata } = input;

      await ctx.db.transaction(async (tx) => {
        // 更新API Key
        await tx.update(apiOrders)
          .set({ apiKey: newApiKey })
          .where(eq(apiOrders.orderId, orderId));

        // 记录历史
        await tx.insert(orderHistory).values({
          orderId,
          action: 'reset_api_key',
          content: `重置API Key - 原因: ${reason}`,
          operatorId: ctx.session?.user?.id,
          operatorName: ctx.session?.user?.name,
          metadata
        });
      });

      return { success: true };
    }),

  // Plus充值处理进度更新
  updatePlusRechargeProgress: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.enum(['processing', 'retry_needed', 'completed', 'failed']),
      failureReason: z.string().optional(),
      note: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, status, failureReason, note, metadata } = input;

      await ctx.db.transaction(async (tx) => {
        // 更新订单状态
        await tx.update(orders)
          .set({ 
            orderStatus: status,
            updatedAt: new Date()
          })
          .where(eq(orders.id, orderId));

        if (status === 'failed' || status === 'retry_needed') {
          await tx.update(plusRechargeOrders)
            .set({ 
              failureReason,
              retryCount: sql`retry_count + 1`
            })
            .where(eq(plusRechargeOrders.orderId, orderId));
        }

        // 记录历史
        await tx.insert(orderHistory).values({
          orderId,
          action: 'update_progress',
          content: `充值进度更新 - ${status}${note ? ` - ${note}` : ''}`,
          operatorId: ctx.session?.user?.id,
          operatorName: ctx.session?.user?.name,
          metadata
        });
      });

      return { success: true };
    }),

  // 获取订单历史记录
  getHistory: protectedProcedure
    .input(z.object({
      orderId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.query.orderHistory.findMany({
        where: eq(orderHistory.orderId, input.orderId),
        orderBy: (history, { desc }) => [desc(history.createdAt)],
      });

      return history;
    }),

  // 加速器订单续期
  renewAcceleratorOrder: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      duration: z.string(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, duration, metadata } = input;

      await ctx.db.transaction(async (tx) => {
        const order = await tx.query.acceleratorOrders.findFirst({
          where: eq(acceleratorOrders.orderId, orderId)
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "订单不存在"
          });
        }

        // 计算新的到期时间
        const currentExpiry = order.expiresAt ?? new Date();
        const [amount, unit] = duration.match(/(\d+)([mdy])/).slice(1);
        const days = unit === 'd' ? parseInt(amount) :
                    unit === 'm' ? parseInt(amount) * 30 :
                    parseInt(amount) * 365;
        
        const newExpiryDate = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

        // 更新到期时间
        await tx.update(acceleratorOrders)
          .set({ 
            expiresAt: newExpiryDate,
            duration: sql`CONCAT(duration, '+${duration}')`
          })
          .where(eq(acceleratorOrders.orderId, orderId));

        // 记录历史
        await tx.insert(orderHistory).values({
          orderId,
          action: 'renew_order',
          content: `续期 ${duration} - 新到期时间: ${newExpiryDate.toISOString()}`,
          operatorId: ctx.session?.user?.id,
          operatorName: ctx.session?.user?.name,
          metadata
        });
      });

      return { success: true };
    }),
});