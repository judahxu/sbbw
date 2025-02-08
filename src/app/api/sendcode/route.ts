// app/api/sendcode/route.ts
import { db } from "~/server/db";
import redis from '~/server/db/redis';
import { NextResponse } from 'next/server';
import { sendVerificationEmail, generateVerificationCode } from '~/server/services/email';
import { z } from 'zod';

// Request body schemas
const sendCodeSchema = z.object({
  email: z.string().email(),
  type: z.enum(['register', 'reset'])
});

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string(),
  type: z.enum(['register', 'reset'])
});

type SendCodeRequest = z.infer<typeof sendCodeSchema>;
type VerifyCodeRequest = z.infer<typeof verifyCodeSchema>;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const { email, type } = sendCodeSchema.parse(body);

    // 检查用户是否存在
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (type === 'register') {
      if (user) {
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 400 }
        );
      }
    } else {
      // 其他场景（如重置密码）：用户必须存在
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // 生成验证码
    const code = generateVerificationCode();
    
    // 存储验证码,5分钟过期
    const key = `verify:${type}:${email}`;
    // await redis.set(key, code, 'EX', 300); // 设置键值对，并设置过期时间为 300 秒（5 分钟）
    await redis.set(key, code, { ex: 300 }); // Upstash Redis的正确写法

    console.log(`Verification code for ${key}: ${code}`);
    
    // 发送验证码邮件
    const success = await sendVerificationEmail(email, code);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body: unknown = await req.json();
    const { email, code, type } = verifyCodeSchema.parse(body);
    
    const key = `verify:${type}:${email}`;
    const storedCode = await redis.get(key);
    console.log(`Stored code for ${key}: ${storedCode} ?? 'unknown'`);

    if (!storedCode || storedCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    // 验证成功后删除验证码
    await redis.del(key);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}