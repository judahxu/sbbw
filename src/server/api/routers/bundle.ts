// src/server/api/routers/bundle.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { bundles } from "~/server/db/schema";
import { and, eq, like, sql } from "drizzle-orm";

const featureSchema = z.object({
  label: z.string().min(1, "特性描述不能为空"),
  included: z.boolean()
});

const bundleSchema = z.object({
  name: z.string().min(1, "请输入套餐名称"),
  description: z.string().min(1, "请输入套餐描述"),
  accountType: z.enum(["permanent", "temporary"]),
  platform: z.enum(["chatgpt", "claude"]),
  plusDuration: z.string().nullable(),
  acceleratorDuration: z.string().nullable(),
  features: z.array(featureSchema).min(1, "请至少添加一个特性"),
  originalPrice: z.number().min(0, "原价不能小于0"),
  salePrice: z.number().min(0, "优惠价不能小于0"),
  tag: z.string().nullable(),
  status: z.enum(["active", "inactive"])
});


export const bundleRouter = createTRPCRouter({
  // 获取套餐列表
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["active", "inactive", "all"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { search, status, page, pageSize } = input;
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(sql`(${bundles.name} LIKE ${`%${search}%`} OR ${bundles.description} LIKE ${`%${search}%`})`);
      }
      
      if (status && status !== 'all') {
        whereConditions.push(eq(bundles.status, status));
      }
      const items = await ctx.db.query.bundles.findMany({
        where: and(...whereConditions),
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: [bundles.createdAt]
      });

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(bundles)
        .where(and(...whereConditions));
      console.log(items);
      return {
        items,
        total: count,
        page,
        pageSize,
      };
    }),

  // 获取套餐详情
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bundle = await ctx.db.query.bundles.findFirst({
        where: eq(bundles.id, input.id),
      });

      if (!bundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "套餐不存在"
        });
      }

      return bundle;
    }),

  // 创建套餐
  create: protectedProcedure
    .input(bundleSchema)
    .mutation(async ({ ctx, input }) => {
      // 检查价格合理性
      if (input.salePrice > input.originalPrice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "优惠价不能高于原价"
        });
      }

      const result = await ctx.db.insert(bundles).values({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, id: result.insertId };
    }),

  // 更新套餐
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: bundleSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // 检查套餐是否存在
      const bundle = await ctx.db.query.bundles.findFirst({
        where: eq(bundles.id, id),
      });

      if (!bundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "套餐不存在"
        });
      }

      // 检查价格合理性
      if (data.salePrice > data.originalPrice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "优惠价不能高于原价"
        });
      }

      await ctx.db.update(bundles)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(bundles.id, id));

      return { success: true };
    }),

  // 更改套餐状态
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["active", "inactive"])
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;

      await ctx.db.update(bundles)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(bundles.id, id));

      return { success: true };
    }),

  // 获取统计数据
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        inactive: sql<number>`SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END)`
      })
      .from(bundles);

    return stats[0];
  }),
});