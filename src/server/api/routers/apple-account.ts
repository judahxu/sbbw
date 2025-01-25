// src/server/api/routers/apple-account.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, like, sql } from "drizzle-orm";
import { appleAccounts } from "~/server/db/schema";

// 状态枚举
const AccountStatus = z.enum(["available", "sold", "abnormal"]);

// 分页参数验证
const paginationSchema = z.object({
  pageSize: z.number().min(1).max(100),
  currentPage: z.number().min(1),
  email: z.string().optional(),
  status: AccountStatus.optional(),
});

// 账号基础信息验证
const accountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  status: AccountStatus,
  notes: z.string().optional(),
  orderId: z.string().optional(),
});

export const appleAccountRouter = createTRPCRouter({
  // 获取列表
  getAccounts: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const { pageSize, currentPage, email, status } = input;
      const offset = (currentPage - 1) * pageSize;

      // 构建where条件
      const conditions = [];
      if (email) {
        conditions.push(like(appleAccounts.email, `%${email}%`));
      }
      if (status) {
        conditions.push(eq(appleAccounts.status, status));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 获取总数
      const totalCountQuery = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(appleAccounts)
        .where(whereClause);
      const totalCount = totalCountQuery[0].count;

      // 获取分页数据
      const accounts = await ctx.db
        .select()
        .from(appleAccounts)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(appleAccounts.createdAt.desc());

      return {
        accounts,
        totalCount,
        pageSize,
        currentPage,
      };
    }),

  // 创建账号
  createAccount: protectedProcedure
    .input(accountSchema)
    .mutation(async ({ ctx, input }) => {
      // 检查邮箱是否已存在  
      const existing = await ctx.db
        .select({ id: appleAccounts.id })
        .from(appleAccounts)
        .where(eq(appleAccounts.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "邮箱已存在",
        });
      }

      return ctx.db.insert(appleAccounts).values({
        ...input,
        id: crypto.randomUUID(),
      });
    }),

  // 更新账号
  updateAccount: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: accountSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // 如果状态改为已售，检查orderId
      if (data.status === "sold" && !data.orderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "已售状态必须提供订单号",
        });
      }

      // 如果更新邮箱，检查是否存在
      if (data.email) {
        const existing = await ctx.db
          .select({ id: appleAccounts.id })
          .from(appleAccounts)
          .where(and(
            eq(appleAccounts.email, data.email),
            sql`id != ${id}`
          ))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "邮箱已存在",
          });
        }
      }

      // 如果状态改为已售，自动添加售出时间
      const updateData = {
        ...data,
        ...(data.status === "sold" ? { soldAt: new Date() } : {}),
      };

      return ctx.db
        .update(appleAccounts)
        .set(updateData)
        .where(eq(appleAccounts.id, id));
    }),

  // 批量导入
  batchImport: protectedProcedure
    .input(z.array(accountSchema))
    .mutation(async ({ ctx, input }) => {
      // 检查邮箱是否有重复
      const emails = input.map(account => account.email);
      const existing = await ctx.db
        .select({ email: appleAccounts.email })
        .from(appleAccounts)
        .where(sql`email IN ${emails}`);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `以下邮箱已存在：${existing.map(e => e.email).join(", ")}`,
        });
      }

      // 批量插入
      return ctx.db.insert(appleAccounts).values(
        input.map(account => ({
          ...account,
          id: crypto.randomUUID(),
        }))
      );
    }),

  // 获取统计数据
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const stats = await ctx.db
        .select({
          total: sql<number>`count(*)`,
          available: sql<number>`sum(case when status = 'available' then 1 else 0 end)`,
          sold: sql<number>`sum(case when status = 'sold' then 1 else 0 end)`,
          abnormal: sql<number>`sum(case when status = 'abnormal' then 1 else 0 end)`,
        })
        .from(appleAccounts);

      return stats[0];
    }),
});