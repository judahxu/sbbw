// src/server/api/routers/accelerator.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { acceleratorServices, acceleratorDevices } from "~/server/db/schema";
import { and, eq, like, sql } from "drizzle-orm";

const createAcceleratorSchema = z.object({
  accountId: z.string(),
  type: z.enum(["personal", "team"]),
  duration: z.enum(["1m", "3m", "6m", "12m"]),
  userEmail: z.string().email(),
});

export const acceleratorRouter = createTRPCRouter({
  // 获取加速器列表
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["active", "expired", "expiring"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { search, status, page, pageSize } = input;
      
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(
          sql`(${acceleratorServices.accountId} LIKE ${`%${search}%`} OR ${acceleratorServices.userEmail} LIKE ${`%${search}%`})`
        );
      }
      
      if (status) {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        switch (status) {
          case 'active':
            whereConditions.push(sql`${acceleratorServices.expiresAt} > ${sevenDaysLater}`);
            break;
          case 'expiring':
            whereConditions.push(sql`
              ${acceleratorServices.expiresAt} <= ${sevenDaysLater} AND 
              ${acceleratorServices.expiresAt} > ${now}
            `);
            break;
          case 'expired':
            whereConditions.push(sql`${acceleratorServices.expiresAt} <= ${now}`);
            break;
        }
      }

      // 查询总数
      const [{ count }] = await ctx.db
        .select({ 
          count: sql<number>`count(*)` 
        })
        .from(acceleratorServices)
        .where(and(...whereConditions));

      // 查询数据
      const items = await ctx.db
        .select({
          id: acceleratorServices.id,
          accountId: acceleratorServices.accountId,
          type: acceleratorServices.type,
          deviceLimit: acceleratorServices.deviceLimit,
          userEmail: acceleratorServices.userEmail,
          duration: acceleratorServices.duration,
          status: acceleratorServices.status,
          expiresAt: acceleratorServices.expiresAt,
          createdAt: acceleratorServices.createdAt,
          deviceCount: sql<number>`(
            SELECT count(*)
            FROM ${acceleratorDevices}
            WHERE ${acceleratorDevices.serviceId} = ${acceleratorServices.id}
          )`
        })
        .from(acceleratorServices)
        .where(and(...whereConditions))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(acceleratorServices.createdAt);
        console.log(items);
      return {
        items,
        total: count,
        page,
        pageSize,
      };
    }),

  // 获取统计数据
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [stats] = await ctx.db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN ${acceleratorServices.expiresAt} > ${now} THEN 1 ELSE 0 END)`,
        expiringSoon: sql<number>`SUM(CASE WHEN 
          ${acceleratorServices.expiresAt} <= ${sevenDaysLater} AND 
          ${acceleratorServices.expiresAt} > ${now} 
          THEN 1 ELSE 0 END)`,
        deviceUsage: sql<string>`CONCAT(
          (SELECT COUNT(*) FROM ${acceleratorDevices}),
          '/',
          SUM(${acceleratorServices.deviceLimit})
        )`
      })
      .from(acceleratorServices);

    return stats;
  }),

  // 创建加速器账号
  create: protectedProcedure
    .input(createAcceleratorSchema)
    .mutation(async ({ ctx, input }) => {
      const { accountId, type, duration, userEmail } = input;

      // 检查账号ID是否已存在
      const exists = await ctx.db.query.acceleratorServices.findFirst({
        where: eq(acceleratorServices.accountId, accountId),
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "账号ID已存在",
        });
      }

      // 计算过期时间
      const now = new Date();
      const months = duration === "1m" ? 1 
        : duration === "3m" ? 3 
        : duration === "6m" ? 6 
        : 12;
      const expiresAt = new Date(now.setMonth(now.getMonth() + months));

      // 设置设备限制
      const deviceLimit = type === "personal" ? 2 : 5;

      // 创建账号
      const result = await ctx.db.insert(acceleratorServices).values({
        accountId,
        type,
        deviceLimit,
        userEmail,
        startsAt: new Date(),
        expiresAt,
        status: 'active',
      });

      return { success: true, id: result.insertId };
    }),

  // 设备管理相关接口
  addDevice: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
      deviceId: z.string(),
      deviceName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serviceId, deviceId, deviceName } = input;

      // 检查服务是否存在且有效
      const service = await ctx.db.query.acceleratorServices.findFirst({
        where: eq(acceleratorServices.id, serviceId),
      });

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "加速器服务不存在",
        });
      }

      // 检查是否超出设备限制
      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(acceleratorDevices)
        .where(eq(acceleratorDevices.serviceId, serviceId));

      if (count >= service.deviceLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "已达到设备数量限制",
        });
      }

      // 添加设备
      await ctx.db.insert(acceleratorDevices).values({
        serviceId,
        deviceId,
        deviceName,
        lastActiveAt: new Date(),
      });

      return { success: true };
    }),

  removeDevice: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
      deviceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serviceId, deviceId } = input;

      await ctx.db.delete(acceleratorDevices)
        .where(and(
          eq(acceleratorDevices.serviceId, serviceId),
          eq(acceleratorDevices.deviceId, deviceId)
        ));

      return { success: true };
    }),

  listDevices: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const devices = await ctx.db.query.acceleratorDevices.findMany({
        where: eq(acceleratorDevices.serviceId, input.serviceId),
        orderBy: desc(acceleratorDevices.lastActiveAt),
      });

      return devices;
    }),

  // 续期
  renew: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
      duration: z.enum(["1m", "3m", "6m", "12m"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serviceId, duration } = input;

      const service = await ctx.db.query.acceleratorServices.findFirst({
        where: eq(acceleratorServices.id, serviceId),
      });

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "加速器服务不存在",
        });
      }
      const currentDurationMonths = parseInt(service.duration.replace('m', ''));
      const newDurationMonths = parseInt(duration.replace('m', ''));
      const totalMonths = currentDurationMonths + newDurationMonths;
      
      const newDuration = `${totalMonths}m`;
      const expiryDate = new Date(Math.max(service.expiresAt.getTime(), Date.now()));
      expiryDate.setMonth(expiryDate.getMonth() + newDurationMonths);

      // 更新过期时间
      await ctx.db.update(acceleratorServices)
        .set({
          expiresAt: expiryDate,
          status: 'active',
          duration: newDuration,
          updatedAt: new Date(),
        })
        .where(eq(acceleratorServices.id, serviceId));

      return { success: true };
    }),
});