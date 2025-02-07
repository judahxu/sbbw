import { NextResponse } from 'next/server';
import { wechatPay } from '@/lib/wechatpay';
import { eq } from 'drizzle-orm';
import { paymentRecords } from '@/server/db/schema';
import { db } from '@/server/db';
import crypto from 'crypto';

interface PaymentRequest {
  orderId: string;
  amount: number;
  description: string;
}

export async function POST(request: Request) {
  try {
    const { orderId, amount, description } = await request.json() as PaymentRequest;;

    // 参数验证
    if (!orderId || !amount || !description) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // const paymentNo = "PAY" + Date.now().toString();

    // await db.insert(paymentRecords).values({
    //   id: crypto.randomUUID(),
    //   orderId,
    //   paymentNo,
    //   amount: (amount / 100).toFixed(2), // 将金额转换为字符串并保留两位小数
    //   status: 'pending',
    //   paymentMethod: 'wechat',
    // });

    const result = await wechatPay.unifiedOrder({
      outTradeNo: orderId,
      body: description,
      totalFee: 1, // 转换为分
      spbillCreateIp: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('支付下单错误:', error);
    const errorMessage = (error as Error).message || '创建支付订单失败';
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}