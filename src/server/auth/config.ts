// src/server/auth/config.ts
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { accounts, sessions, users, verificationTokens } from "~/server/db/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      // emailVerified: Date | null;
    } & DefaultSession["user"];
  }
   // 扩展User接口以包含role属性
   interface User {
    role?: string;
  }
}


// 登录表单验证schema
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
});

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { 
          label: "邮箱", 
          type: "email",
          placeholder: "your@email.com" 
        },
        password: { 
          label: "密码", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        try {
          // 验证输入
          const { email, password } = loginSchema.parse(credentials);

          // 查询用户
          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email)
          });

          if (!user?.hashedPassword) {
            throw new Error("用户不存在或密码未设置");
          }

          // 验证密码
          const isValid = await bcrypt.compare(password, user.hashedPassword);
          if (!isValid) {
            throw new Error("邮箱或密码错误");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(error.errors[0]?.message);
          }
          throw error;
        }
        
      }
    })
  ],
  callbacks: {
    session: ({ session, token  }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
      },
    }),
    // 添加JWT callback以支持credentials provider
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register"
  },
  session: {
    strategy: "jwt", // 使用JWT而不是database strategy，因为使用了credentials provider
  },
} satisfies NextAuthConfig;