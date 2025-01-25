import type { NextApiRequest, NextApiResponse } from 'next';
import { wechatPay } from '@/lib/wechatpay';

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
      
      // TODO: 更新订单状态
      // await updateOrderStatus(notifyData.out_trade_no, 'paid');
      
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