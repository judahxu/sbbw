import { type NextRequest, NextResponse } from 'next/server';
import { wechatPay } from '@/lib/wechatpay';
import { eq,sql } from 'drizzle-orm';
import { orders, paymentRecords, appleAccounts, serverAccounts } from '@/server/db/schema';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // 验证签名
    const isValid = await wechatPay.verifyNotify(body);
    if (!isValid) {
      return new NextResponse('FAIL', { status: 400 });
    }

    // 解析通知数据
    const notifyData = await wechatPay.xmlToObject(body);

    if (notifyData.return_code === 'SUCCESS' && 
        notifyData.result_code === 'SUCCESS') {
      
      return await db.transaction(async (tx) => {
        // 获取支付记录
        const paymentRecord = await tx
          .select()
          .from(paymentRecords)
          .where(eq(paymentRecords.paymentNo, notifyData.out_trade_no))
          .limit(1)
          .for('update');

        if (!paymentRecord.length) {
          throw new Error('Payment record not found');
        }

        const payment = paymentRecord[0];
        if (!payment) {
          throw new Error('Payment record is undefined');
        }

        // 如果已支付，直接返回成功
        if (payment.status === 'paid') {
          return new NextResponse('SUCCESS', { 
            headers: { 'Content-Type': 'text/xml' }
          });
        }

        // 更新支付记录状态
        await tx
          .update(paymentRecords)
          .set({
            status: 'paid',
            paidAt: new Date(),
            transactionId: notifyData.transaction_id,
          })
          .where(eq(paymentRecords.paymentNo, notifyData.out_trade_no));

        // 更新订单状态为已支付
        await tx.update(orders)
          .set({
            status: 'paid',
            updatedAt: new Date(),
          })
          .where(eq(orders.id, payment.orderId));

        // 获取订单详情并进行自动处理
        const order = await tx.query.orders.findFirst({
          where: eq(orders.id, payment.orderId),
          with: {
            appleIdOrder: true,
            accelerationOrder: true,
            rechargeOrder: true,
          },
        });

        if (!order) {
          throw new Error('Order not found');
        }

        // 根据订单类型进行自动处理
        switch (order.type) {
          case 'appleId':
            const availableAccount = await tx.query.appleAccounts.findFirst({
              where: eq(appleAccounts.status, 'available'),
            });

            if (availableAccount) {
              await tx.update(appleAccounts)
                .set({
                  status: 'sold',
                  orderId: order.id,
                  soldAt: new Date(),
                })
                .where(eq(appleAccounts.id, availableAccount.id));

              await tx.update(orders)
                .set({
                  status: 'completed',
                  processedAt: new Date(),
                  processedBy: 'system',
                })
                .where(eq(orders.id, order.id));
            } else {
              await tx.update(orders)
                .set({
                  status: 'processing',
                  remark: '无可用账号，等待手动处理',
                })
                .where(eq(orders.id, order.id));
            }
            break;

          case 'acceleration':
            const availableServer = await tx.query.serverAccounts.findFirst({
              where: eq(serverAccounts.status, 'available'),
            });

            if (availableServer) {
              const duration = order.accelerationOrder?.plan === 'monthly' ? 30 :
                             order.accelerationOrder?.plan === 'quarterly' ? 90 : 365;

              await tx.update(serverAccounts)
                .set({
                  status: 'assigned',
                  assignedTo: order.userId,
                  assignmentStart: new Date(),
                  duration,
                  assignmentEnd: sql`DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${duration} DAY)`,
                })
                .where(eq(serverAccounts.id, availableServer.id));

              await tx.update(orders)
                .set({
                  status: 'completed',
                  processedAt: new Date(),
                  processedBy: 'system',
                })
                .where(eq(orders.id, order.id));
            } else {
              await tx.update(orders)
                .set({
                  status: 'processing',
                  remark: '无可用服务器，等待手动处理',
                })
                .where(eq(orders.id, order.id));
            }
            break;

          case 'recharge':
            await tx.update(orders)
              .set({
                status: 'processing',
                remark: '等待手动处理充值',
              })
              .where(eq(orders.id, order.id));
            break;
        }

        // 返回成功响应
        return new NextResponse(
          `<xml>
            <return_code><![CDATA[SUCCESS]]></return_code>
            <return_msg><![CDATA[OK]]></return_msg>
          </xml>`,
          { 
            headers: { 'Content-Type': 'text/xml' }
          }
        );
      });
    }
    
    return new NextResponse('FAIL', { status: 400 });
  } catch (error) {
    console.error('处理支付回调错误:', error);
    return new NextResponse('FAIL', { status: 500 });
  }
}