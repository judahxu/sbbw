// src/server/api/routers/auth.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { users } from "~/server/db/schema";  // 引入users表
import { eq } from "drizzle-orm";  // 引入drizzle操作符

const passwordSchema = z.string().min(6, "密码至少6个字符");

export const authRouter = createTRPCRouter({
  // 注册
  register: publicProcedure
    .input(z.object({
      email: z.string().email("请输入有效的邮箱地址"),
      password: passwordSchema,
      name: z.string().min(2, "名称至少2个字符").optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // 检查邮箱是否已存在
      const exists = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "该邮箱已被注册",
        });
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建用户
      await ctx.db.insert(users).values({
        email,
        hashedPassword,
        name,
        role: "user",
      });

      return { success: true };
    }),

  // 修改密码
  resetPassword: publicProcedure
    .input(z.object({
      email: z.string().email("请输入有效的邮箱地址"),
      newPassword: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, newPassword } = input;

      // 查找用户
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "用户不存在",
        });
      }

      // 更新密码
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await ctx.db.update(users)
        .set({ hashedPassword })
        .where(eq(users.id, user.id));

      return { success: true };
    }),
});