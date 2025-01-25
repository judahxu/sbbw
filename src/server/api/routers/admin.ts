// src/server/api/routers/admin.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, serviceAccounts, apiKeys, acceleratorServices } from "~/server/db/schema";
import { desc, eq, like, and, gte, lte, sql } from "drizzle-orm";

// 查询参数验证schema
const listUsersSchema = z.object({
  keyword: z.string().optional(),
  roles: z.array(z.enum(["user", "member", "admin"])).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10)
});

export const adminRouter = createTRPCRouter({
  // 获取用户列表
  listUsers: protectedProcedure
    .input(listUsersSchema)
    .query(async ({ ctx, input }) => {
      const { keyword, roles, dateRange, page, pageSize } = input;
      
      // 构建where条件
      const whereConditions = [];
      
      if (keyword) {
        whereConditions.push(
          sql`(${users.name} LIKE ${`%${keyword}%`} OR ${users.email} LIKE ${`%${keyword}%`})`
        );
      }
      
      if (roles?.length) {
        whereConditions.push(sql`${users.role} IN (${roles.join(',')})`);
      }
      
      if (dateRange?.from) {
        whereConditions.push(sql`${users.emailVerified} >= ${dateRange.from}`);
      }
      
      if (dateRange?.to) {
        whereConditions.push(sql`${users.emailVerified} <= ${dateRange.to}`);
      }
      
      // 计算总数
      const [{ count }] = await ctx.db
        .select({ 
          count: sql<number>`count(*)` 
        })
        .from(users)
        .where(and(...whereConditions));
      
      // 查询用户列表
      const userList = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          emailVerified: users.emailVerified,
          image: users.image,
          // 聚合计算服务数量
          // services: sql<{
          //   accounts: number;
          //   apiKeys: number;
          //   accelerators: number;
          // }>`json_object(
          //   'accounts', (
          //     SELECT COUNT(*) 
          //     FROM ${serviceAccounts}
          //     WHERE ${serviceAccounts.assignedTo} = ${users.id}
          //   ),
          //   'apiKeys', (
          //     SELECT COUNT(*) 
          //     FROM ${apiKeys}
          //     WHERE ${apiKeys.userId} = ${users.id}
          //   ),
          //   'accelerators', (
          //     SELECT COUNT(*) 
          //     FROM ${acceleratorServices}
          //     WHERE ${acceleratorServices.userId} = ${users.id}
          //   )
          // )`
        })
        .from(users)
        .where(and(...whereConditions))
        .orderBy(desc(users.emailVerified))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        users: userList,
        pagination: {
          total: count,
          page,
          pageSize,
          pageCount: Math.ceil(count / pageSize)
        }
      };
    }),
});