import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, like, sql } from "drizzle-orm";
import { serverAccounts } from "@/server/db/schema";

// 验证规则
const serverAccountSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  config: z.string().min(1, "配置不能为空"),
});

const statusEnum = z.enum(["available", "assigned", "expired"]);

// 服务器账号路由
export const serverAccountRouter = createTRPCRouter({
  // 获取列表
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).default(10),
        searchName: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "没有访问权限",
        });
      }

      const { page, pageSize, searchName, status } = input;
      const offset = (page - 1) * pageSize;

      // 构建查询条件
      const conditions = [];
      if (searchName) {
        conditions.push(like(serverAccounts.name, `%${searchName}%`));
      }
      if (status && status !== "all") {
        conditions.push(eq(serverAccounts.status, status));
      }

      // 查询数据
      const [accounts, totalQuery] = await Promise.all([
        ctx.db
          .select()
          .from(serverAccounts)
          .where(and(...conditions))
          .orderBy(serverAccounts.createdAt.desc())
          .limit(pageSize)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(serverAccounts)
          .where(and(...conditions)),
      ]);

      const total = totalQuery[0].count;

      return {
        data: accounts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // 创建账号
  create: protectedProcedure
    .input(serverAccountSchema)
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "没有访问权限",
        });
      }

      const account = await ctx.db.insert(serverAccounts).values({
        name: input.name,
        config: input.config,
        status: "available",
      });

      return account;
    }),

  // 删除账号
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "没有访问权限",
        });
      }

      // 检查账号状态
      const account = await ctx.db
        .select()
        .from(serverAccounts)
        .where(eq(serverAccounts.id, input.id))
        .limit(1);

      if (!account.length || account[0].status !== "expired") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "只能删除已过期的账号",
        });
      }

      await ctx.db
        .delete(serverAccounts)
        .where(eq(serverAccounts.id, input.id));

      return { success: true };
    }),

  // 批量导入
  batchImport: protectedProcedure
    .input(
      z.object({
        accounts: z.array(serverAccountSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "没有访问权限",
        });
      }

      const accounts = input.accounts.map((account) => ({
        ...account,
        status: "available",
      }));

      await ctx.db.insert(serverAccounts).values(accounts);

      return {
        success: true,
        count: accounts.length,
      };
    }),
});