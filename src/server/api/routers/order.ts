import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { orders, rechargeOrders, appleIdOrders, accelerationOrders } from "~/server/db/schema";

// 输入验证Schema
const OrderStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded'
]);

const OrderTypeSchema = z.enum(['recharge', 'appleId', 'acceleration']);

const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

const OrderFilterSchema = z.object({
  type: OrderTypeSchema.optional(),
  status: OrderStatusSchema.optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// 处理订单的输入Schema
const ProcessRechargeSchema = z.object({
  orderId: z.string(),
  giftCardCode: z.string(),
  remark: z.string().optional(),
});

const ProcessAppleIdSchema = z.object({
  orderId: z.string(),
  email: z.string().email(),
  password: z.string(),
  remark: z.string().optional(),
});

const ProcessAccelerationSchema = z.object({
  orderId: z.string(),
  configuration: z.object({
    server: z.string(),
    port: z.number(),
    password: z.string(),
  }),
  remark: z.string().optional(),
});

export const orderRouter = createTRPCRouter({
  // 获取订单列表
  getOrders: protectedProcedure
    .input(PaginationSchema.merge(OrderFilterSchema))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, type, status, search, startDate, endDate } = input;
      const offset = (page - 1) * pageSize;

      // 构建where条件
      const whereConditions = [];
      if (type) whereConditions.push(eq(orders.type, type));
      if (status) whereConditions.push(eq(orders.status, status));
      if (startDate) whereConditions.push(sql`created_at >= ${startDate}`);
      if (endDate) whereConditions.push(sql`created_at <= ${endDate}`);
      if (search) {
        whereConditions.push(
          sql`id LIKE ${`%${search}%`} OR user_id LIKE ${`%${search}%`}`
        );
      }

      // 查询订单
      const [orderList, totalCount] = await Promise.all([
        ctx.db.query.orders.findMany({
          where: and(...whereConditions),
          limit: pageSize,
          offset,
          orderBy: (orders, { desc }) => [desc(orders.createdAt)],
          with: {
            user: true,
            rechargeOrder: true,
            appleIdOrder: true,
            accelerationOrder: true,
          },
        }),
        ctx.db.query.orders.findMany({
          where: and(...whereConditions),
          columns: {
            id: true,
          },
        }).then(results => results.length),
      ]);

      return {
        orders: orderList,
        total: totalCount,
        page,
        pageSize,
      };
    }),

  // 获取订单详情
  getOrderDetail: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          user: true,
          rechargeOrder: true,
          appleIdOrder: true,
          accelerationOrder: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '订单不存在',
        });
      }

      return order;
    }),

  // 获取订单统计
  getOrderStats: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrders, monthlyIncome] = await Promise.all([
      // 今日订单数
      ctx.db.query.orders.findMany({
        where: sql`created_at >= ${today}`,
        columns: {
          id: true,
        },
      }).then(results => results.length),

      // 待处理订单数
      ctx.db.query.orders.findMany({
        where: eq(orders.status, 'paid'),
        columns: {
          id: true,
        },
      }).then(results => results.length),

      // 本月收入
      ctx.db.select({
        total: sql<number>`SUM(amount)`,
      })
      .from(orders)
      .where(and(
        eq(orders.status, 'completed'),
        sql`MONTH(created_at) = MONTH(CURRENT_DATE())`,
        sql`YEAR(created_at) = YEAR(CURRENT_DATE())`
      ))
      .then(result => result[0]?.total ?? 0),
    ]);

    return {
      today: todayOrders,
      pending: pendingOrders,
      monthlyIncome,
    };
  }),

  // 处理充值订单
  processRechargeOrder: protectedProcedure
    .input(ProcessRechargeSchema)
    .mutation(async ({ ctx, input }) => {
      const { orderId, giftCardCode, remark } = input;

      // 开启事务
      return await ctx.db.transaction(async (tx) => {
        // 检查订单状态
        const order = await tx.query.orders.findFirst({
          where: and(
            eq(orders.id, orderId),
            eq(orders.type, 'recharge'),
          ),
        });

        if (!order || order.status !== 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '订单状态不正确',
          });
        }

        // 更新订单状态
        await tx.update(orders)
          .set({
            status: 'completed',
            processedBy: ctx.session.user.id,
            processedAt: new Date(),
            remark,
          })
          .where(eq(orders.id, orderId));

        // 更新充值订单信息
        await tx.update(rechargeOrders)
          .set({
            giftCardCode,
          })
          .where(eq(rechargeOrders.orderId, orderId));

        return { success: true };
      });
    }),

  // 处理美区账号订单
  processAppleIdOrder: protectedProcedure
    .input(ProcessAppleIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { orderId, email, password, remark } = input;

      return await ctx.db.transaction(async (tx) => {
        const order = await tx.query.orders.findFirst({
          where: and(
            eq(orders.id, orderId),
            eq(orders.type, 'appleId'),
          ),
        });

        if (!order || order.status !== 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '订单状态不正确',
          });
        }

        await tx.update(orders)
          .set({
            status: 'completed',
            processedBy: ctx.session.user.id,
            processedAt: new Date(),
            remark,
          })
          .where(eq(orders.id, orderId));

        await tx.update(appleIdOrders)
          .set({
            email,
            password,
          })
          .where(eq(appleIdOrders.orderId, orderId));

        return { success: true };
      });
    }),

  // 处理加速服务订单
  processAccelerationOrder: protectedProcedure
    .input(ProcessAccelerationSchema)
    .mutation(async ({ ctx, input }) => {
      const { orderId, configuration, remark } = input;

      return await ctx.db.transaction(async (tx) => {
        const order = await tx.query.orders.findFirst({
          where: and(
            eq(orders.id, orderId),
            eq(orders.type, 'acceleration'),
          ),
        });

        if (!order || order.status !== 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '订单状态不正确',
          });
        }

        await tx.update(orders)
          .set({
            status: 'completed',
            processedBy: ctx.session.user.id,
            processedAt: new Date(),
            remark,
          })
          .where(eq(orders.id, orderId));

        await tx.update(accelerationOrders)
          .set({
            configuration,
          })
          .where(eq(accelerationOrders.orderId, orderId));

        return { success: true };
      });
    }),

  // 取消订单
  cancelOrder: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, reason } = input;

      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order || !['pending_payment', 'paid'].includes(order.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '订单无法取消',
        });
      }

      await ctx.db.update(orders)
        .set({
          status: 'cancelled',
          remark: reason,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      return { success: true };
    }),
});