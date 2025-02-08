import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import redis from "~/server/db/redis"; // 确保引入 redis 客户端

const passwordSchema = z.string().min(6, "密码至少6个字符");

export const authRouter = createTRPCRouter({
  // 注册
  register: publicProcedure
    .input(z.object({
      email: z.string().email("请输入有效的邮箱地址"),
      password: passwordSchema,
      name: z.string().min(2, "名称至少2个字符").optional(),
      code: z.string().length(6, "验证码必须是6位"), // 添加验证码字段
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, password, name, code } = input;

      // 验证验证码
      const key = `verify:register:${email}`;
      const storedCode = await redis.get(key);

      console.log("验证码:", storedCode,code);

      if (!storedCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "验证码已过期",
        });
      }

      if (storedCode !== code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "验证码错误",
        });
      }

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
      const result = await ctx.db.insert(users).values({
        email,
        hashedPassword,
        name,
        role: "user",
      });

      // 验证成功后删除验证码
      await redis.del(key);

      return { success: true };
    }),

  // 修改密码
  resetPassword: publicProcedure
    .input(z.object({
      email: z.string().email("请输入有效的邮箱地址"),
      newPassword: passwordSchema,
      code: z.string().length(6, "验证码必须是6位"), // 添加验证码字段
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, newPassword, code } = input;

      // 验证验证码
      const key = `verify:reset:${email}`;
      const storedCode = await redis.get(key);

      if (!storedCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "验证码已过期",
        });
      }

      if (storedCode !== code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "验证码错误",
        });
      }

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

      // 验证成功后删除验证码
      await redis.del(key);

      return { success: true };
    }),
});