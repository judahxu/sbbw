// src/server/api/routers/config.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { configs } from "~/server/db/schema";
import { toString } from './../../../../node_modules/mdast-util-to-string/lib/index';

// 配置类型枚举
const ConfigType = {
  ACCELERATION: 'acceleration',
  APPSTORE: 'appstore',
  EXCHANGE_RATE: 'exchange_rate',
  SERVICE_FEE: 'service_fee',
} as const;

export const configRouter = createTRPCRouter({
  // 获取所有配置
  getAll: publicProcedure
    .input(z.object({
      type: z.enum(['acceleration', 'appstore', 'exchange_rate', 'service_fee']).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      // 检查权限

      try {
        // if (input.type) {
          return await ctx.db.query.configs.findMany({
            where: input?.type ? eq(configs.type, input.type) : undefined,
          });
        // }
        return await ctx.db.query.configs.findMany();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取配置失败'
        });
      }
    }),

  // 获取单个配置
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无权限访问'
        });
      }

      try {
        const config = await ctx.db.query.configs.findFirst({
          where: eq(configs.id, input)
        });

        if (!config) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '配置不存在'
          });
        }

        return config;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取配置失败'
        });
      }
    }),

  // 更新配置
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      cycle: z.enum(['monthly', 'quarterly', 'yearly', 'once']).optional(),
      original_price: z.number().min(0).optional(),
      current_price: z.number().min(0).optional(),
      exchange_rate: z.number().min(0).optional(),
      fee_percentage: z.number().min(0).max(100).optional(),
      minimum_fee: z.number().min(0).optional(),
      maximum_fee: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无权限访问'
        });
      }

      try {
        const { id, ...updateData } = input;

        // 检查配置是否存在
        const existing = await ctx.db.query.configs.findFirst({
          where: eq(configs.id, id)
        });

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '配置不存在'
          });
        }

        // 更新配置
        await ctx.db.update(configs)
          .set({
            ...updateData,
            updated_at: sql`CURRENT_TIMESTAMP(3)`,
            updated_by: ctx.session.user.id,
            exchange_rate: updateData.exchange_rate?.toString(),
            original_price: updateData.original_price?.toString(),
            current_price: updateData.current_price?.toString(),
            fee_percentage: updateData.fee_percentage?.toString(),
            minimum_fee: updateData.minimum_fee?.toString(),
            maximum_fee: updateData.maximum_fee?.toString(),

          })
          .where(eq(configs.id, id));

        return await ctx.db.query.configs.findFirst({
          where: eq(configs.id, id)
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新配置失败'
        });
      }
    }),

  // 更新汇率
  updateExchangeRate: protectedProcedure
    .input(z.object({
      rate: z.number().min(0)
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无权限访问'
        });
      }

      try {
        await ctx.db.update(configs)
          .set({
            exchange_rate: input.rate.toString(),
            updated_at: sql`CURRENT_TIMESTAMP(3)`,
            updated_by: ctx.session.user.id
          })
          .where(eq(configs.type, 'exchange_rate'));

        return await ctx.db.query.configs.findFirst({
          where: eq(configs.type, 'exchange_rate')
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新汇率失败'
        });
      }
    }),

  // 更新服务费
  updateServiceFee: protectedProcedure
    .input(z.object({
      percentage: z.number().min(0).max(100),
      minimum_fee: z.number().min(0).optional(),
      maximum_fee: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无权限访问'
        });
      }

      try {
        await ctx.db.update(configs)
          .set({
            fee_percentage: input.percentage.toString(),
            minimum_fee: input?.minimum_fee?.toString(),  
            maximum_fee: input.maximum_fee?.toString(),
            updated_at: sql`CURRENT_TIMESTAMP(3)`,
            updated_by: ctx.session.user.id
          })
          .where(eq(configs.type, 'service_fee'));

        return await ctx.db.query.configs.findFirst({
          where: eq(configs.type, 'service_fee')
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新服务费失败'
        });
      }
    }),
});