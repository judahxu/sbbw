import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  serviceAccounts, 
  serviceAccountSubscriptions,
  acceleratorServices,
  AccountStatus,
  AccountPlatform
} from "~/server/db/schema";
import { and, eq, like, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// 账号状态验证器
const accountStatusSchema = z.enum(['in_stock', 'assigned', 'expired']);

// 账号平台验证器
const platformSchema = z.enum(['gpt', 'claude']);

// 基础账号信息验证器
const accountSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(8, "密码至少8个字符"),
  platform: platformSchema,
  type: z.enum(['permanent', 'temporary']),
  status: z.string().optional(),
  bundleType: z.string().optional(),
  // 临时账号
  temporaryDuration: z.string().optional().nullable(),
    
  // 加速器
  hasAccelerator: z.boolean().default(false),
  acceleratorDuration: z.string().optional().nullable(),
  
  // Plus
  hasPlusSubscription: z.boolean().default(false),
  plusDuration: z.string().optional().nullable(),
});


// 在Router中处理过期时间的计算
const calculateExpireAt = (duration: string) => {
  const now = new Date();
  const [amount, unit] = duration.match(/(\d+)([dy])/).slice(1);
  const days = unit === 'd' ? parseInt(amount) : parseInt(amount) * 365;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

export const serviceAccountRouter = createTRPCRouter({
  // 获取账号列表
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      platform: platformSchema.optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { search, status, platform, page, pageSize } = input;
      
      // 构建查询条件
      const where = [
        sql`${serviceAccounts.plusDuration} IS NULL`
      ];
      if (search) {
        where.push(like(serviceAccounts.email, `%${search}%`));
      }
      if (status) {
        where.push(eq(serviceAccounts.status, status));
      }
      if (platform) {
        where.push(eq(serviceAccounts.platform, platform));
      }

      // 查询总数
      const totalPromise = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(serviceAccounts)
        .where(and(...where));

      // 查询数据
      const accountsPromise = ctx.db.query.serviceAccounts.findMany({
        where: and(...where),
        with: {
          plusSubscription: true,
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: desc(serviceAccounts.createdAt),
      });

      const [total, items] = await Promise.all([totalPromise, accountsPromise]);
      console.log(total, items);
      return {
        items,
        total: total[0].count,
        page,
        pageSize,
      };
    }),

  // 获取账号详情
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.query.serviceAccounts.findFirst({
        where: eq(serviceAccounts.id, input.id),
        with: {
          assignedUser: true,
          plusSubscription: true,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "账号不存在",
        });
      }

      return account;
    }),

  // 创建账号
  create: protectedProcedure
    .input(accountSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, platform, type, metadata } = input;

      // 检查邮箱是否已存在
      const exists = await ctx.db.query.serviceAccounts.findFirst({
        where: eq(serviceAccounts.email, email),
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "该邮箱已存在",
        });
      }

      // 密码加密
      // const hashedPassword = await bcrypt.hash(password, 12);

      // 创建账号
      const result = await ctx.db.insert(serviceAccounts).values({
        email,
        password,
        platform,
        type,
        status: 'in_stock',
        metadata,
        bundleType: input.bundleType,
        
        // 处理临时账号
        temporaryDuration: input.type === 'temporary' ? input.temporaryDuration : null,
        temporaryExpireAt: input.type === 'temporary' && input.temporaryDuration 
          ? calculateExpireAt(input.temporaryDuration) 
          : null,
        
        // 处理加速器
        acceleratorDuration: input.hasAccelerator ? input.acceleratorDuration : null,
        acceleratorExpireAt: input.hasAccelerator && input.acceleratorDuration 
          ? calculateExpireAt(input.acceleratorDuration)
          : null,
        
        // 处理Plus
        plusDuration: input.hasPlusSubscription ? input.plusDuration : null,
        plusExpireAt: input.hasPlusSubscription && input.plusDuration 
          ? calculateExpireAt(input.plusDuration)
          : null,
      });

      return { success: true, id: result.insertId };
    }),

  // 编辑账号
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: accountSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // 检查账号是否存在
      const account = await ctx.db.query.serviceAccounts.findFirst({
        where: eq(serviceAccounts.id, id),
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "账号不存在",
        });
      }

      // 如果更新邮箱，检查是否已存在
      if (data.email && data.email !== account.email) {
        const exists = await ctx.db.query.serviceAccounts.findFirst({
          where: eq(serviceAccounts.email, data.email),
        });

        if (exists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "该邮箱已存在",
          });
        }
      }

      // 如果有密码更新，需要加密
      // if (data.password) {
      //   data.password = await bcrypt.hash(data.password, 12);
      // }

      await ctx.db.update(serviceAccounts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(serviceAccounts.id, id));

      return { success: true };
    }),

  // 重置密码
  resetPassword: protectedProcedure
    .input(z.object({
      id: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, password } = input;

      // const hashedPassword = await bcrypt.hash(password, 12);

      await ctx.db.update(serviceAccounts)
        .set({ 
          password: password,
          updatedAt: new Date(),
        })
        .where(eq(serviceAccounts.id, id));

      return { success: true, newPassword: password };
    }),

  // 批量导入
  import: protectedProcedure
    .input(z.array(accountSchema))
    .mutation(async ({ ctx, input }) => {
      // 批量检查邮箱
      const emails = input.map(item => item.email);
      const existingAccounts = await ctx.db.query.accounts.findMany({
        where: sql`email IN ${emails}`,
      });

      if (existingAccounts.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `存在${existingAccounts.length}个重复邮箱`,
        });
      }

      // 批量处理密码加密
      const accountsToInsert = await Promise.all(
        input.map(async (item) => ({
          ...item,
          status: 'in_stock',
        }))
      );

      await ctx.db.insert(serviceAccounts).values(accountsToInsert);

      return { success: true, count: input.length };
    }),

  // 获取统计数据
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        total: sql<number>`COALESCE(count(*), 0)`,
        inStock: sql<number>`COALESCE(sum(case when status = 'in_stock' then 1 else 0 end), 0)`,
        assigned: sql<number>`COALESCE(sum(case when status = 'assigned' then 1 else 0 end), 0)`,
        expired: sql<number>`COALESCE(sum(case when status = 'expired' then 1 else 0 end), 0)`
      })
      .from(serviceAccounts);

    // 即将到期的账号数量
    const expiringSoon = await ctx.db
      .select({ count: sql<number>`COALESCE(count(*), 0)` })
      .from(serviceAccountSubscriptions)
      .where(sql`expires_at <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`);
      console.log(stats,expiringSoon);
    return {
      ...stats[0],
      expiringSoon: expiringSoon[0].count,
    };
  }),








  // Plus账号列表
  listPlus: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['active', 'expiring', 'renewal']).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { search, status, page, pageSize } = input;
      
      const whereConditions = [
        // 只查询Plus账号
        sql`${serviceAccounts.plusDuration} IS NOT NULL`
      ];
      
      if (search) {
        whereConditions.push(
          sql`(${serviceAccounts.email} LIKE ${`%${search}%`} OR ${serviceAccounts.assignedEmail} LIKE ${`%${search}%`})`
        );
      }

      // 根据状态筛选
      if (status) {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        switch (status) {
          case 'active':
            whereConditions.push(sql`${serviceAccounts.plusExpireAt} > ${sevenDaysLater}`);
            break;
          case 'expiring':
            whereConditions.push(sql`
              ${serviceAccounts.plusExpireAt} <= ${sevenDaysLater} AND 
              ${serviceAccounts.plusExpireAt} > ${now}
            `);
            break;
          case 'renewal':
            whereConditions.push(sql`${serviceAccounts.plusExpireAt} <= ${now}`);
            break;
        }
      }

      // 查询总数
      const [{ count }] = await ctx.db
        .select({ 
          count: sql<number>`count(*)` 
        })
        .from(serviceAccounts)
        .where(and(...whereConditions));

      // 查询数据
      const items = await ctx.db
        .select()
        .from(serviceAccounts)
        .where(and(...whereConditions))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(serviceAccounts.updatedAt);

      return {
        items,
        total: count,
        page,
        pageSize,
      };
    }),

  // Plus账号统计
  getPlusStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [stats] = await ctx.db
      .select({
        total: sql<number>`SUM(CASE WHEN ${serviceAccounts.plusDuration} IS NOT NULL THEN 1 ELSE 0 END)`,
        autoRenewal: sql<number>`SUM(CASE WHEN ${serviceAccounts.plusDuration} IS NOT NULL AND ${serviceAccounts.isActive} = true THEN 1 ELSE 0 END)`,
        newThisMonth: sql<number>`SUM(CASE WHEN ${serviceAccounts.plusDuration} IS NOT NULL AND ${serviceAccounts.createdAt} >= ${monthStart} THEN 1 ELSE 0 END)`,
        expiringSoon: sql<number>`SUM(CASE WHEN 
          ${serviceAccounts.plusDuration} IS NOT NULL AND 
          ${serviceAccounts.plusExpireAt} <= ${sevenDaysLater} AND
          ${serviceAccounts.plusExpireAt} > ${now}
          THEN 1 ELSE 0 END)`
      })
      .from(serviceAccounts);

    return stats;
  }),

  // 创建Plus账号
  createPlus: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      platform: z.enum(["gpt", "claude"]),
      type: z.enum(["permanent", "temporary"]),
      bundleType: z.string().optional(),
      plusDuration: z.string(),
      acceleratorDuration: z.string().optional(),
      assignedEmail: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        email,
        password,
        platform,
        type,
        bundleType,
        plusDuration,
        acceleratorDuration,
        assignedEmail,
      } = input;

      // 检查邮箱是否已存在
      const exists = await ctx.db.query.serviceAccounts.findFirst({
        where: eq(serviceAccounts.email, email),
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "该邮箱已存在",
        });
      }

      // 计算到期时间
      const calculateExpireAt = (duration: string) => {
        const now = new Date();
        const match = duration.match(/(\d+)([mdy])/);
        if (!match) return null;
        
        const [, amount, unit] = match;
        const months = unit === 'm' ? parseInt(amount) :
                      unit === 'y' ? parseInt(amount) * 12 : 0;
        const days = unit === 'd' ? parseInt(amount) : 0;
        
        if (months > 0) {
          return new Date(now.setMonth(now.getMonth() + months));
        } else if (days > 0) {
          return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        }
        return null;
      };

      // const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await ctx.db.insert(serviceAccounts).values({
        email,
        password,
        platform,
        type,
        status: 'in_stock',
        bundleType,
        plusDuration,
        plusExpireAt: calculateExpireAt(plusDuration),
        acceleratorDuration,
        acceleratorExpireAt: acceleratorDuration ? calculateExpireAt(acceleratorDuration) : null,
        assignedEmail,
        isActive: true,
      });

      return { success: true };
    }),

  // 更新Plus账号
  updatePlus: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        platform: z.enum(["gpt", "claude"]).optional(),
        type: z.enum(["permanent", "temporary"]).optional(),
        bundleType: z.string().optional(),
        plusDuration: z.string().optional(),
        acceleratorDuration: z.string().optional(),
        assignedEmail: z.string().email().optional(),
        isActive: z.boolean().optional(),
        password: z.string().min(8).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // 计算新的到期时间
      if (data.plusDuration) {
        const now = new Date();
        const [amount, unit] = data.plusDuration.match(/(\d+)([mdy])/).slice(1);
        const months = unit === 'm' ? parseInt(amount) :
                      unit === 'y' ? parseInt(amount) * 12 : 0;
        data.plusExpireAt = new Date(now.setMonth(now.getMonth() + months));
      }

      if (data.acceleratorDuration) {
        const now = new Date();
        const [amount, unit] = data.acceleratorDuration.match(/(\d+)([mdy])/).slice(1);
        const days = unit === 'd' ? parseInt(amount) :
                    unit === 'y' ? parseInt(amount) * 365 :
                    unit === 'm' ? parseInt(amount) * 30 : 0;
        data.acceleratorExpireAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }

      await ctx.db.update(serviceAccounts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(serviceAccounts.id, id));

      return { success: true };
    }),






});