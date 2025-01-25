// src/server/api/routers/pricing.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  pricingRules,
  priceAdjustments,
  promotions,
  promotionRules,
  products,
} from "~/server/db/schema";
import { and, eq, lte, gte, sql } from "drizzle-orm";

// 价格规则验证
const pricingRuleSchema = z.object({
  name: z.string(),
  type: z.enum([
    "base",           // 基础价格
    "option",         // 选项加价
    "quantity",       // 数量阶梯
    "userLevel",      // 用户等级
    "custom"          // 自定义规则
  ]),
  priority: z.number(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(["eq", "gt", "lt", "gte", "lte", "in", "between"]),
    value: z.any()
  })),
  adjustment: z.object({
    type: z.enum(["fixed", "percentage", "formula"]),
    value: z.union([z.number(), z.string()]),
  }),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// 促销规则验证
const promotionSchema = z.object({
  name: z.string(),
  type: z.enum([
    "discount",      // 直接折扣
    "amount_off",    // 固定金额
    "bundle",        // 捆绑销售
    "gift",          // 赠品
  ]),
  conditions: z.array(z.object({
    type: z.enum([
      "product",     // 指定产品
      "quantity",    // 购买数量
      "amount",      // 订单金额
      "user_level",  // 用户等级
      "first_time",  // 首次购买
    ]),
    value: z.any()
  })),
  benefit: z.object({
    type: z.enum(["percentage", "fixed", "product"]),
    value: z.any()
  }),
  startTime: z.date(),
  endTime: z.date(),
  userLimit: z.number().optional(),
  totalLimit: z.number().optional(),
  status: z.enum(["draft", "active", "ended"]).default("draft"),
});

export const pricingRouter = createTRPCRouter({
  // 价格规则相关接口
  listRules: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
      type: z.string().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { productId, type, status } = input;
      
      const whereConditions = [];
      
      if (productId) {
        whereConditions.push(eq(pricingRules.productId, productId));
      }
      
      if (type) {
        whereConditions.push(eq(pricingRules.type, type));
      }
      
      if (status) {
        whereConditions.push(eq(pricingRules.status, status));
      }

      const rules = await ctx.db.query.pricingRules.findMany({
        where: and(...whereConditions),
        orderBy: [
          pricingRules.priority,
          pricingRules.createdAt
        ],
      });

      return rules;
    }),

  createRule: protectedProcedure
    .input(z.object({
      productId: z.string(),
      rule: pricingRuleSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const { productId, rule } = input;

      const [newRule] = await ctx.db.insert(pricingRules).values({
        productId,
        name: rule.name,
        type: rule.type,
        priority: rule.priority,
        conditions: rule.conditions,
        adjustment: rule.adjustment,
        startTime: rule.startTime,
        endTime: rule.endTime,
        status: rule.status,
      }).returning();

      return { success: true, id: newRule.id };
    }),

  updateRule: protectedProcedure
    .input(z.object({
      id: z.string(),
      rule: pricingRuleSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, rule } = input;

      await ctx.db.update(pricingRules)
        .set(rule)
        .where(eq(pricingRules.id, id));

      return { success: true };
    }),

  // 价格调整记录
  listAdjustments: protectedProcedure
    .input(z.object({
      productId: z.string(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { productId, startDate, endDate } = input;
      
      const whereConditions = [eq(priceAdjustments.productId, productId)];
      
      if (startDate) {
        whereConditions.push(gte(priceAdjustments.createdAt, startDate));
      }
      
      if (endDate) {
        whereConditions.push(lte(priceAdjustments.createdAt, endDate));
      }

      const adjustments = await ctx.db.query.priceAdjustments.findMany({
        where: and(...whereConditions),
        orderBy: desc(priceAdjustments.createdAt),
      });

      return adjustments;
    }),

  // 促销活动相关接口
  listPromotions: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "active", "ended"]).optional(),
      type: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { status, type } = input;
      
      const whereConditions = [];
      
      if (status) {
        whereConditions.push(eq(promotions.status, status));
      }
      
      if (type) {
        whereConditions.push(eq(promotions.type, type));
      }

      const promotionsList = await ctx.db.query.promotions.findMany({
        where: and(...whereConditions),
        with: {
          rules: true,
        },
        orderBy: [
          promotions.startTime,
          promotions.endTime,
        ],
      });

      return promotionsList;
    }),

  createPromotion: protectedProcedure
    .input(promotionSchema)
    .mutation(async ({ ctx, input }) => {
      // 检查时间冲突
      const existing = await ctx.db.query.promotions.findFirst({
        where: and(
          lte(promotions.startTime, input.endTime),
          gte(promotions.endTime, input.startTime),
          eq(promotions.status, 'active')
        )
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "该时间段已有活动进行中"
        });
      }

      const [promotion] = await ctx.db.insert(promotions).values({
        name: input.name,
        type: input.type,
        benefit: input.benefit,
        startTime: input.startTime,
        endTime: input.endTime,
        userLimit: input.userLimit,
        totalLimit: input.totalLimit,
        status: input.status,
      }).returning();

      // 创建促销规则
      await ctx.db.insert(promotionRules).values(
        input.conditions.map(condition => ({
          promotionId: promotion.id,
          type: condition.type,
          value: condition.value,
        }))
      );

      return { success: true, id: promotion.id };
    }),

  updatePromotion: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: promotionSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      await ctx.db.update(promotions)
        .set(data)
        .where(eq(promotions.id, id));

      if (data.conditions) {
        // 删除旧规则
        await ctx.db.delete(promotionRules)
          .where(eq(promotionRules.promotionId, id));

        // 创建新规则
        await ctx.db.insert(promotionRules).values(
          data.conditions.map(condition => ({
            promotionId: id,
            type: condition.type,
            value: condition.value,
          }))
        );
      }

      return { success: true };
    }),

  // 计算最终价格
  calculatePrice: protectedProcedure
    .input(z.object({
      productId: z.string(),
      options: z.record(z.any()).optional(),
      quantity: z.number().default(1),
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { productId, options, quantity, userId } = input;

      // 获取产品基础信息
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, productId),
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
          message: "产品不存在"
        });
      }

      // 获取有效的价格规则
      const rules = await ctx.db.query.pricingRules.findMany({
        where: and(
          eq(pricingRules.productId, productId),
          eq(pricingRules.status, 'active'),
          lte(pricingRules.startTime, new Date()),
          gte(pricingRules.endTime, new Date())
        ),
        orderBy: pricingRules.priority
      });

      // 基础价格
      let finalPrice = product.basePrice;

      // 应用选项加价
      if (options) {
        for (const groupId in options) {
          const option = product.optionGroups
            .find(g => g.id === groupId)
            ?.options.find(o => o.value === options[groupId]);
          if (option) {
            finalPrice += option.price;
          }
        }
      }

      // 应用价格规则
      for (const rule of rules) {
        // 检查规则条件
        const match = await checkRuleConditions(rule.conditions, {
          quantity,
          userId,
          options
        });

        if (match) {
          // 应用价格调整
          finalPrice = applyPriceAdjustment(finalPrice, rule.adjustment);
        }
      }

      // 获取有效的促销活动
      const activePromotions = await ctx.db.query.promotions.findMany({
        where: and(
          eq(promotions.status, 'active'),
          lte(promotions.startTime, new Date()),
          gte(promotions.endTime, new Date())
        ),
        with: {
          rules: true
        }
      });

      // 应用促销优惠
      for (const promotion of activePromotions) {
        // 检查促销条件
        const match = await checkPromotionConditions(promotion.rules, {
          productId,
          quantity,
          userId,
          amount: finalPrice
        });

        if (match) {
          // 应用促销优惠
          finalPrice = applyPromotionBenefit(finalPrice, promotion.benefit);
        }
      }

      // 记录价格计算记录
      await ctx.db.insert(priceAdjustments).values({
        productId,
        basePrice: product.basePrice,
        finalPrice,
        adjustments: {
          options,
          rules: rules.map(r => r.id),
          promotions: activePromotions.map(p => p.id)
        }
      });

      return {
        basePrice: product.basePrice,
        finalPrice,
        currency: 'CNY'
      };
    }),
});



// 价格规则表
export const pricingRules = createTable("pricing_rule", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  priority: int("priority").notNull().default(0),
  conditions: json("conditions").notNull(),
  adjustment: json("adjustment").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: varchar("status", { length: 20 })
    .notNull()
    .default('active'),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// 价格调整记录表
export const priceAdjustments = createTable("price_adjustment", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id),
  basePrice: decimal("base_price", { precision: 10, scale: 2 })
    .notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 })
    .notNull(),
  adjustments: json("adjustments").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 继续补充Schema部分...

// 促销活动表
export const promotions = createTable("promotion", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  benefit: json("benefit").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  userLimit: int("user_limit"),
  totalLimit: int("total_limit"),
  usedCount: int("used_count").default(0),
  status: varchar("status", { length: 20 })
    .notNull()
    .default('draft'),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// 促销规则表
export const promotionRules = createTable("promotion_rule", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  promotionId: varchar("promotion_id", { length: 255 })
    .notNull()
    .references(() => promotions.id),
  type: varchar("type", { length: 50 }).notNull(),
  value: json("value").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 促销使用记录表
export const promotionUsage = createTable("promotion_usage", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  promotionId: varchar("promotion_id", { length: 255 })
    .notNull()
    .references(() => promotions.id),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  orderId: varchar("order_id", { length: 255 })
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 })
    .notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 价格规则审计表
export const pricingRuleAudits = createTable("pricing_rule_audit", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ruleId: varchar("rule_id", { length: 255 })
    .notNull()
    .references(() => pricingRules.id),
  action: varchar("action", { length: 50 }).notNull(),
  changes: json("changes"),
  operatorId: varchar("operator_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 关系定义
export const pricingRulesRelations = relations(pricingRules, ({ one, many }) => ({
  product: one(products, {
    fields: [pricingRules.productId],
    references: [products.id]
  }),
  audits: many(pricingRuleAudits)
}));

export const priceAdjustmentsRelations = relations(priceAdjustments, ({ one }) => ({
  product: one(products, {
    fields: [priceAdjustments.productId],
    references: [products.id]
  })
}));

export const promotionsRelations = relations(promotions, ({ many }) => ({
  rules: many(promotionRules),
  usages: many(promotionUsage)
}));

export const promotionRulesRelations = relations(promotionRules, ({ one }) => ({
  promotion: one(promotions, {
    fields: [promotionRules.promotionId],
    references: [promotions.id]
  })
}));

// 辅助函数
/**
 * 检查价格规则条件是否满足
 */
export async function checkRuleConditions(
  conditions: any[],
  context: {
    quantity: number;
    userId?: string;
    options?: Record<string, any>;
  }
): Promise<boolean> {
  for (const condition of conditions) {
    switch (condition.operator) {
      case 'eq':
        if (context[condition.field] !== condition.value) return false;
        break;
      case 'gt':
        if (context[condition.field] <= condition.value) return false;
        break;
      case 'lt':
        if (context[condition.field] >= condition.value) return false;
        break;
      case 'in':
        if (!condition.value.includes(context[condition.field])) return false;
        break;
      case 'between':
        if (
          context[condition.field] < condition.value[0] ||
          context[condition.field] > condition.value[1]
        ) return false;
        break;
    }
  }
  return true;
}

/**
 * 应用价格调整
 */
export function applyPriceAdjustment(
  price: number,
  adjustment: {
    type: 'fixed' | 'percentage' | 'formula';
    value: number | string;
  }
): number {
  switch (adjustment.type) {
    case 'fixed':
      return price + Number(adjustment.value);
    case 'percentage':
      return price * (1 + Number(adjustment.value) / 100);
    case 'formula':
      // 使用eval执行公式，需要注意安全性
      const formula = adjustment.value.replace('price', price.toString());
      return eval(formula);
    default:
      return price;
  }
}

/**
 * 应用促销优惠
 */
export function applyPromotionBenefit(
  price: number,
  benefit: {
    type: 'percentage' | 'fixed' | 'product';
    value: any;
  }
): number {
  switch (benefit.type) {
    case 'percentage':
      return price * (1 - Number(benefit.value) / 100);
    case 'fixed':
      return Math.max(0, price - Number(benefit.value));
    case 'product':
      // 赠品逻辑，不影响价格
      return price;
    default:
      return price;
  }
}