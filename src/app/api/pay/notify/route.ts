import type { NextApiRequest, NextApiResponse } from 'next';
import { wechatPay } from '@/lib/wechatpay';
import { eq } from 'drizzle-orm';
import { orders , paymentRecords } from '@/server/db/schema';
import { db } from '@/server/db';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    // 验证签名
    const isValid = await wechatPay.verifyNotify(req.body);
    if (!isValid) {
      return res.status(400).send('FAIL');
    }

    // 解析通知数据
    const notifyData = await wechatPay.xmlToObject(req.body);

    if (notifyData.return_code === 'SUCCESS' && 
        notifyData.result_code === 'SUCCESS') {
          console.log('notifyData', notifyData);
          const paymentRecord = await db
            .select()
            .from(paymentRecords)
            .where(eq(paymentRecords.paymentNo, notifyData.out_trade_no))
            .limit(1)
            .for('update'); // 使用 SELECT FOR UPDATE 锁定记录

          if (!paymentRecord.length) {
            throw new Error('Payment record not found');
          }

          const payment = paymentRecord[0];

          // 2. 检查支付状态，防止重复处理
          if (payment.status === 'paid') {
            return; // 已经处理过了，直接返回
          }

          // 3. 更新支付记录状态
          await db
            .update(paymentRecords)
            .set({
              status: 'paid',
              paidAt: new Date(),
              transactionId: notifyData.transaction_id, // 保存微信支付交易号
            })
            .where(eq(paymentRecords.paymentNo, notifyData.out_trade_no));

      await db.update(orders)
      .set({
        status: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, result.orderId));
      // 返回成功响应
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`
        <xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
        </xml>
      `);
    }
    
    return res.status(400).send('FAIL');
  } catch (error) {
    console.error('处理支付回调错误:', error);
    return res.status(500).send('FAIL');
  }
}