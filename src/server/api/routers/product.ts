// src/server/api/routers/product.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { products, productOptions, optionGroups } from "~/server/db/schema";
import { and, eq, like, sql } from "drizzle-orm";

// 选项验证schema
const optionSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  value: z.string(),
  price: z.number(),
});

// 选项组验证schema  
const optionGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  required: z.boolean(),
  options: z.array(optionSchema),
  dependencies: z.array(z.object({
    groupId: z.string(),
    optionValue: z.string()
  }).optional().nullable())
});

// 产品验证schema
const productSchema = z.object({
  name: z.string().min(2, "产品名称至少2个字符"),
  type: z.enum(["account", "accelerator", "recharge"]),
  basePrice: z.number().min(0),
  status: z.enum(["active", "inactive"]),
  description: z.string(),
  optionGroups: z.array(optionGroupSchema)
});

export const productRouter = createTRPCRouter({
  // 获取产品列表
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.enum(["account", "accelerator", "recharge"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { search, type, status, page, pageSize } = input;
      
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(
          sql`(${products.name} LIKE ${`%${search}%`} OR ${products.description} LIKE ${`%${search}%`})`
        );
      }
      
      if (type) {
        whereConditions.push(eq(products.type, type));
      }
      
      if (status) {
        whereConditions.push(eq(products.status, status));
      }

      const totalPromise = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...whereConditions));

      const itemsPromise = ctx.db.query.products.findMany({
        where: and(...whereConditions),
        with: {
          optionGroups: {
            with: {
              options: true
            }
          }
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      const [total, items] = await Promise.all([totalPromise, itemsPromise]);

      return {
        items,
        total: total[0].count,
        page,
        pageSize,
      };
    }),

  // 获取产品详情
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          optionGroups: {
            with: {
              options: true
            }
          }
        }
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "产品不存在",
        });
      }
      console.log(product);
      return product;
    }),

  // 创建产品
  create: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {

      try {
        // 生成产品ID
        const productId = crypto.randomUUID();

        // 创建产品
        await ctx.db.insert(products).values({
          id: productId,
          name: input.name,
          type: input.type,
          basePrice: input.basePrice,
          status: input.status,
          description: input.description
        })
        .$returningId()


        // 创建选项组和选项
        if (input.optionGroups && input.optionGroups.length > 0) {
          for (const group of input.optionGroups) {
            // 生成选项组ID            
            // 创建选项组
            await ctx.db.insert(optionGroups).values({
              id: group.id,
              productId: productId,
              name: group.name,
              required: group.required,
              dependencies: group.dependencies
            });

            // 创建选项
            if (group.options && group.options.length > 0) {
              await ctx.db.insert(productOptions).values(
                group.options.map(option => ({
                  id: option.id, // 为每个选项生成ID
                  groupId: group.id, // 使用选项组ID
                  label: option.label,
                  value: option.value,
                  price: option.price
                }))
              );
            }
          }
        }

        return { success: true, id: productId };
      } catch (error) {
        console.error('创建产品错误:', error);
        throw error;
      }
      
    }),

  // 更新产品
  update: protectedProcedure
  .input(z.object({
    id: z.string(),
    data: productSchema
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, data } = input;

    // 先检查产品是否存在
    const product = await ctx.db.query.products.findFirst({
      where: eq(products.id, id)
    });

    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "产品不存在",
      });
    }

    // 更新产品基本信息
    await ctx.db.update(products)
      .set({
        name: data.name,
        type: data.type,
        basePrice: data.basePrice,
        status: data.status,
        description: data.description
      })
      .where(eq(products.id, id));

    // 删除旧的选项组和选项
    const oldGroups = await ctx.db.query.optionGroups.findMany({
      where: eq(optionGroups.productId, id)
    });

    for (const group of oldGroups) {
      // 先删除选项
      await ctx.db.delete(productOptions)
        .where(eq(productOptions.groupId, group.id));
    }

    await ctx.db.delete(optionGroups)
      .where(eq(optionGroups.productId, id));

    // 创建新的选项组和选项
    for (const group of data.optionGroups) {
      const groupResult = await ctx.db.insert(optionGroups).values({
        id: group.id,
        productId: id,
        name: group.name,
        required: group.required,
        dependencies: group.dependencies
      });

      await ctx.db.insert(productOptions).values(
        group.options.map(option => ({
          id: option.id,
          groupId:group.id,
          label: option.label,
          value: option.value,
          price: option.price
        }))
      );
    }

    return { success: true };
  }),

  // 修改产品状态
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["active", "inactive"])
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(products)
        .set({ status: input.status })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  // 删除产品
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 检查是否有关联的订单
      const hasOrders = await ctx.db.query.orders.findFirst({
        where: eq(orders.productId, input.id)
      });

      if (hasOrders) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "该产品已有订单,无法删除",
        });
      }

      // 删除产品及关联数据
      await ctx.db.delete(products)
        .where(eq(products.id, input.id));

      return { success: true };
    }),
});