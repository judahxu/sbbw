// src/server/api/routers/productConfig.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  configTemplates, 
  productConfigs,
  configVersions 
} from "~/server/db/schema";
import { and, eq, like, sql } from "drizzle-orm";

// 配置模板验证
const templateSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["account", "accelerator", "recharge"]),
  config: z.object({
    optionGroups: z.array(z.object({
      name: z.string(),
      required: z.boolean(),
      options: z.array(z.object({
        label: z.string(),
        value: z.string(),
        price: z.number()
      }))
    }))
  }).or(z.string())  // 允许JSON字符串
});

export const productConfigRouter = createTRPCRouter({
  // 获取配置模板列表
  listTemplates: protectedProcedure
    .input(z.object({
      type: z.enum(["account", "accelerator", "recharge"]).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { type, search } = input;
      
      const whereConditions = [];
      
      if (type) {
        whereConditions.push(eq(configTemplates.type, type));
      }
      
      if (search) {
        whereConditions.push(
          like(configTemplates.name, `%${search}%`)
        );
      }

      const templates = await ctx.db.query.configTemplates.findMany({
        where: and(...whereConditions),
        orderBy: configTemplates.createdAt,
      });

      return templates;
    }),

  // 创建配置模板
  createTemplate: protectedProcedure
    .input(templateSchema)
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db.insert(configTemplates).values({
        name: input.name,
        type: input.type,
        config: typeof input.config === 'string' 
          ? input.config 
          : JSON.stringify(input.config)
      }).returning();

      return { success: true, id: template.id };
    }),

  // 应用配置模板
  applyTemplate: protectedProcedure
    .input(z.object({
      productId: z.string(),
      templateId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { productId, templateId } = input;

      // 获取模板
      const template = await ctx.db.query.configTemplates.findFirst({
        where: eq(configTemplates.id, templateId)
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "模板不存在"
        });
      }

      // 创建新的配置版本
      const [version] = await ctx.db.insert(configVersions).values({
        productId,
        config: template.config,
        source: 'template',
        sourceId: templateId
      }).returning();

      // 更新产品当前配置
      await ctx.db.update(productConfigs)
        .set({
          config: template.config,
          versionId: version.id
        })
        .where(eq(productConfigs.productId, productId));

      return { success: true };
    }),

  // 获取配置历史版本
  listVersions: protectedProcedure
    .input(z.object({ 
      productId: z.string() 
    }))
    .query(async ({ ctx, input }) => {
      const versions = await ctx.db.query.configVersions.findMany({
        where: eq(configVersions.productId, input.productId),
        orderBy: [desc(configVersions.createdAt)]
      });

      return versions;
    }),

  // 回滚到指定版本
  rollback: protectedProcedure
    .input(z.object({ 
      productId: z.string(),
      versionId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      const { productId, versionId } = input;

      // 获取指定版本
      const version = await ctx.db.query.configVersions.findFirst({
        where: and(
          eq(configVersions.id, versionId),
          eq(configVersions.productId, productId)
        )
      });

      if (!version) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "版本不存在"
        });
      }

      // 创建新版本
      const [newVersion] = await ctx.db.insert(configVersions).values({
        productId,
        config: version.config,
        source: 'rollback',
        sourceId: versionId
      }).returning();

      // 更新当前配置
      await ctx.db.update(productConfigs)
        .set({
          config: version.config,
          versionId: newVersion.id
        })
        .where(eq(productConfigs.productId, productId));

      return { success: true };
    }),

  // 导出配置
  export: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const config = await ctx.db.query.productConfigs.findFirst({
        where: eq(productConfigs.productId, input.productId),
        with: {
          product: true,
          currentVersion: true
        }
      });

      if (!config) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "配置不存在"
        });
      }

      return {
        name: config.product.name,
        type: config.product.type,
        config: config.config,
        version: config.currentVersion?.version || 1,
        exportedAt: new Date()
      };
    }),

  // 导入配置
  import: protectedProcedure
    .input(z.object({
      productId: z.string(),
      config: templateSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const { productId, config } = input;

      // 创建新版本
      const [version] = await ctx.db.insert(configVersions).values({
        productId,
        config: typeof config === 'string' ? config : JSON.stringify(config),
        source: 'import'
      }).returning();

      // 更新当前配置
      await ctx.db.update(productConfigs)
        .set({
          config: version.config,
          versionId: version.id
        })
        .where(eq(productConfigs.productId, productId));

      return { success: true };
    }),
});