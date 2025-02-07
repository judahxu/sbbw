// src/server/api/routers/dashboard.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq, sql } from "drizzle-orm";
import { orders, appleAccounts, serverAccounts } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
export const dashboardRouter = createTRPCRouter({
  // 获取统计数据
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      // 检查权限
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无权访问'
        });
      }

      // 并行查询各项统计数据
      const [
        revenueData,
        orderCount,
        appleAccountStats,
        serverAccountStats
      ] = await Promise.all([
        // 总收入
        ctx.db
          .select({
            total: sql<number>`SUM(amount)`,
          })
          .from(orders)
          .where(eq(orders.status, 'completed')),

        // 总订单数
        ctx.db
          .select({
            count: sql<number>`COUNT(*)`,
          })
          .from(orders),

        // 美区账号统计
        ctx.db
          .select({
            total: sql<number>`COUNT(*)`,
            available: sql<number>`SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END)`,
          })
          .from(appleAccounts),

        // 加速器账号统计
        ctx.db
          .select({
            total: sql<number>`COUNT(*)`,
            available: sql<number>`SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END)`,
          })
          .from(serverAccounts),
      ]);

      return {
        totalRevenue: Number(revenueData[0]?.total ?? 0),
        totalOrders: Number(orderCount[0]?.count ?? 0),
        totalAccounts: Number(appleAccountStats[0]?.total ?? 0) + Number(serverAccountStats[0]?.total ?? 0),
        appleIdAccounts: Number(appleAccountStats[0]?.total ?? 0),
        acceleratorAccounts: Number(serverAccountStats[0]?.total ?? 0),
        availableAccounts: Number(appleAccountStats[0]?.available ?? 0) + Number(serverAccountStats[0]?.available ?? 0),
        availableAppleIds: Number(appleAccountStats[0]?.available ?? 0),
        availableAccelerators: Number(serverAccountStats[0]?.available ?? 0),
      };
    }),

  // 获取图表数据
  getChartData: protectedProcedure
    .input(z.object({
      type: z.enum(['revenue', 'orders']),
      range: z.enum(['weekly', 'monthly'])
    }))
    .query(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无权访问'
        });
      }

      const { type, range } = input;

      // 构建时间格式化SQL
      const timeFormat = range === 'weekly' 
        ? sql`DATE_FORMAT(created_at, '%Y-W%u')` // 按周格式化
        : sql`DATE_FORMAT(created_at, '%Y-%m')`; // 按月格式化

      // 限制查询范围（最近12个周期）
      const timeLimit = range === 'weekly'
        ? sql`created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 WEEK)`
        : sql`created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)`;

      // 根据类型选择查询内容
      if (type === 'revenue') {
        const data = await ctx.db
          .select({
            time_period: timeFormat,
            value: sql<number>`SUM(amount)`,
          })
          .from(orders)
          .where(and(
            eq(orders.status, 'completed'),
            timeLimit
          ))
          .groupBy(timeFormat)
          .orderBy(timeFormat);

        return data.map(row => ({
          name: row.time_period,
          value: Number(row.value || 0),
        }));
      } else {
        const data = await ctx.db
          .select({
            time_period: timeFormat,
            value: sql<number>`COUNT(*)`,
          })
          .from(orders)
          .where(timeLimit)
          .groupBy(timeFormat)
          .orderBy(timeFormat);

        return data.map(row => ({
          name: row.time_period,
          value: Number(row.value || 0),
        }));
      }
    }),
});

