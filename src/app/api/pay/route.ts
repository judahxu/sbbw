import { NextResponse } from 'next/server';
import { wechatPay } from '@/lib/wechatpay';
import { eq } from 'drizzle-orm';
import { paymentRecords } from '@/server/db/schema';
import { db } from '@/server/db';
import crypto from 'crypto';
export async function POST(request: Request) {
  try {
    const { orderId, amount, description } = await request.json();

    // 参数验证
    if (!orderId || !amount || !description) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    const paymentNo = "PAY" + Date.now().toString();

    await db.insert(paymentRecords).values({
      id: crypto.randomUUID(),
      orderId,
      paymentNo,
      amount:amount/100,
      status: 'pending',
      paymentMethod: 'wechat',
    });

    const result = await wechatPay.unifiedOrder({
      outTradeNo: paymentNo,
      body: description,
      totalFee: amount, // 转换为分
      spbillCreateIp: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('支付下单错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || '创建支付订单失败'
      },
      { status: 500 }
    );
  }
}