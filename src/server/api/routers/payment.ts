import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { orders, paymentRecords } from "@/server/db/schema";

export const paymentRouter = createTRPCRouter({
  createPayment: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      // 可选的备注信息
      remark: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, remark } = input;

      // 1. 验证订单存在且状态正确
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "订单不存在",
        });
      }

      // 验证订单所属
      if (order.userId !== ctx.session.user.id && ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权访问此订单",
        });
      }

      // 验证订单状态
      if (order.status !== 'pending_payment') {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "订单状态不正确",
        });
      }

      // 2. 生成支付流水号
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const paymentNo = `PAY${timestamp}${random}`;

      try {
        // 4. 创建支付记录
        await ctx.db.insert(paymentRecords).values({
          id: crypto.randomUUID(),
          orderId,
          paymentNo,
          amount: order.amount,
          status: 'pending',
          paymentMethod: 'wechat',
          remark,
        });

        // 5. 返回支付信息
        return {
          paymentNo,
        };

      } catch (error) {
        console.error('Create payment error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "创建支付订单失败",
        });
      }
    }),

  // 查询支付状态
  queryPaymentStatus: protectedProcedure
    .input(z.object({
      paymentNo: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.query.paymentRecords.findFirst({
        where: eq(paymentRecords.paymentNo, input.paymentNo),
        with: {
          order: true,
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "支付记录不存在",
        });
      }

      // 验证权限
      if (payment.order.userId !== ctx.session.user.id && ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权查询此支付记录",
        });
      }

      return {
        status: payment.status,
        paidAt: payment.paidAt,
        paymentMethod: payment.paymentMethod,
      };
    }),
});