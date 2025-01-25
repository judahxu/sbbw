import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { apiKeys } from "~/server/db/schema";
import { and, eq, like, sql } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";

const quotaOptions = {
  '100k': 100000,
  '500k': 500000,
  '1m': 1000000,
  '5m': 5000000
} as const;

// API Key 创建验证
const createKeySchema = z.object({
  platform: z.enum(["openai", "claude"]),
  apiKey: z.string().min(20, "API Key 格式不正确"),
  quota: z.enum(["100k", "500k", "1m", "5m"]),
  userEmail: z.string().email("请输入有效的邮箱")
});

// API Key 充值验证
const topUpSchema = z.object({
  keyId: z.string(),
  quota: z.enum(["100k", "500k", "1m", "5m"])
});

export const apiKeyRouter = createTRPCRouter({
  // 获取API Key列表
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["active", "depleted", "warning"]).optional(),
      platform: z.enum(["openai", "claude"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { search, status, platform, page, pageSize } = input;
      
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(
          sql`(${apiKeys.apiKey} LIKE ${`%${search}%`} OR ${apiKeys.userEmail} LIKE ${`%${search}%`})`
        );
      }
      
      if (status) {
        if (status === 'warning') {
          whereConditions.push(sql`${apiKeys.quotaUsed} / ${apiKeys.quotaLimit} >= 0.8`);
        } else if (status === 'depleted') {
          whereConditions.push(sql`${apiKeys.quotaUsed} >= ${apiKeys.quotaLimit}`);
        } else {
          whereConditions.push(sql`${apiKeys.quotaUsed} < ${apiKeys.quotaLimit}`);
        }
      }
      
      if (platform) {
        whereConditions.push(eq(apiKeys.platform, platform));
      }

      const items = await ctx.db.query.apiKeys.findMany({
        where: and(...whereConditions),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(apiKeys)
        .where(and(...whereConditions));

      return {
        items,
        total: count,
        page,
        pageSize,
      };
    }),

  // 获取统计数据
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN quota_used < quota_limit THEN 1 ELSE 0 END)`,
        lowQuota: sql<number>`SUM(CASE WHEN quota_used / quota_limit >= 0.8 AND quota_used < quota_limit THEN 1 ELSE 0 END)`,
        warning: sql<number>`SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END)`
      })
      .from(apiKeys);

    return stats[0];
  }),

  // 创建API Key
  create: protectedProcedure
    .input(createKeySchema)
    .mutation(async ({ ctx, input }) => {
      const { platform, quota, userEmail,apiKey } = input;

      const exists = await ctx.db.query.apiKeys.findFirst({
        where: eq(apiKeys.apiKey, input.apiKey),
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "此API Key已被使用",
        });
      }

      // Create new API Key record
      await ctx.db.insert(apiKeys).values({
        apiKey: input.apiKey,
        platform: input.platform,
        userEmail: input.userEmail,
        quotaLimit: quotaOptions[input.quota],
        quotaUsed: 0,
        status: 'active'
      });

      return { success: true };
    }),

  // API Key充值
  topUp: protectedProcedure
    .input(topUpSchema)
    .mutation(async ({ ctx, input }) => {
      const { keyId, quota } = input;

      const key = await ctx.db.query.apiKeys.findFirst({
        where: eq(apiKeys.id, keyId),
      });

      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API Key不存在",
        });
      }

      await ctx.db.update(apiKeys)
        .set({ 
          quotaLimit: sql`quota_limit + ${quotaOptions[quota]}`,
          status: 'active'
        })
        .where(eq(apiKeys.id, keyId));

      return { success: true };
    }),

  // 禁用API Key
  disable: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(apiKeys)
        .set({ status: 'disabled' })
        .where(eq(apiKeys.id, input.keyId));

      return { success: true };
    }),

  // 检查API Key配额
  checkQuota: protectedProcedure
    .input(z.object({ 
      keyId: z.string(),
      tokensToUse: z.number().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const { keyId, tokensToUse } = input;

      const key = await ctx.db.query.apiKeys.findFirst({
        where: eq(apiKeys.id, keyId),
      });

      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API Key不存在",
        });
      }

      if (key.status === 'disabled') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "API Key已禁用",
        });
      }

      const remainingQuota = key.quotaLimit - key.quotaUsed;
      if (remainingQuota < tokensToUse) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "配额不足",
        });
      }

      await ctx.db.update(apiKeys)
        .set({ 
          quotaUsed: sql`quota_used + ${tokensToUse}`,
          status: sql`CASE 
            WHEN quota_used + ${tokensToUse} >= quota_limit THEN 'depleted'
            ELSE status 
          END`
        })
        .where(eq(apiKeys.id, keyId));

      return {
        success: true,
        remainingQuota: remainingQuota - tokensToUse
      };
    })
});