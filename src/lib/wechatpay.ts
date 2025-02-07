import crypto from 'crypto';
import axios from 'axios';
import { Builder, Parser } from 'xml2js';

interface WechatPayResponse {
  return_code: string;
  return_msg?: string;
  result_code?: string;
  err_code_des?: string;
  code_url?: string;
  prepay_id?: string;
  nonce_str?: string;
  sign?: string;
  out_trade_no: string;
  transaction_id: string;
}

export class WechatPay {
  private appid: string;
  private mchId: string;
  private apiKey: string;
  private notifyUrl: string;
  private unifiedOrderUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

  constructor(config: {
    appid: string;
    mchId: string;
    apiKey: string;
    notifyUrl?: string;
  }) {
    this.appid = config.appid;
    this.mchId = config.mchId;
    this.apiKey = config.apiKey;
    this.notifyUrl = config.notifyUrl ?? 'https://coijing.com/api/pay/notify';
  }

  // 生成随机字符串
  private generateNonceStr(length = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let noceStr = '';
    for (let i = 0; i < length; i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return noceStr;
  }

  // 生成签名
  private generateSign(params: Record<string, any>): string {
    const stringSignTemp = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + `&key=${this.apiKey}`;

    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  }

  // 将对象转换为XML
  public async objectToXML(obj: Record<string, any>): Promise<string> {
    const builder = new Builder({
      rootName: 'xml',
      cdata: true,
      headless: true,
    });

    const filteredObj = Object.keys(obj).reduce((acc, key) => {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        acc[key] = String(obj[key]);
      }
      return acc;
    }, {} as Record<string, string>);

    return builder.buildObject(filteredObj);
  }

  // 将XML转换为对象
  public async xmlToObject(xml: string): Promise<WechatPayResponse> {
    const parser = new Parser({
      explicitArray: false,
      trim: true,
      explicitRoot: false,
    });

    return new Promise((resolve, reject) => {
      parser.parseString(xml, (err, result) => {
        if (err) {
          reject(new Error('解析 XML 失败'));
        } else {
          resolve(result as WechatPayResponse);
        }
      });
    });
  }

  

  // 统一下单
  public async unifiedOrder(params: {
    outTradeNo: string;
    body: string;
    totalFee: number;
    spbillCreateIp: string;
  }) {
    try {
      const requestData = {
        appid: this.appid,
        mch_id: this.mchId,
        nonce_str: this.generateNonceStr(),
        body: params.body,
        out_trade_no: params.outTradeNo,
        total_fee: params.totalFee,
        spbill_create_ip: params.spbillCreateIp,
        notify_url: this.notifyUrl,
        trade_type: 'NATIVE',
      };

      const sign = this.generateSign(requestData);
      const finalRequestData = { ...requestData, sign };

      const xmlData = await this.objectToXML(finalRequestData);
      console.log('请求XML:', xmlData);

      const response = await axios.post(this.unifiedOrderUrl, xmlData, {
        headers: { 'Content-Type': 'text/xml', 'Accept': 'text/xml' },
      });

      console.log('响应数据:', response.data);

      if (typeof response.data !== 'string') {
        throw new Error('Expected XML string response from WeChat API');
      }

      const result = await this.xmlToObject(response.data);

      if (!result) {
        throw new Error('解析响应数据失败');
      }

      if (result.return_code === 'FAIL') {
        throw new Error(`微信支付返回错误: ${result.return_msg ?? '未知错误'}`);
      }

      if (result.result_code === 'FAIL') {
        throw new Error(`微信支付业务错误: ${result.err_code_des ?? '未知错误'}`);
      }

      return {
        codeUrl: result.code_url,
        prepayId: result.prepay_id,
        nonceStr: result.nonce_str,
        sign: result.sign,
      };
    } catch (error) {
      console.error('统一下单请求失败:', error);
        const errorMessage = error instanceof Error 
        ? error.message 
        : '未知错误';
      throw new Error(`支付下单失败: ${errorMessage}`);
    }
  }

  // 验证支付结果通知签名
  public async verifyNotify(xmlData: string) {
    try {
      // 1. 解析XML数据
      const data = await this.xmlToObject(xmlData);
      
      // 2. 取出签名
      const signature = data.sign;
      delete data.sign;
      
      // 3. 重新计算签名
      const calcSign = this.generateSign(data);
      
      // 4. 比对签名
      return calcSign === signature;
    } catch (error) {
      console.error('验证支付通知失败:', error);
      return false;
    }
  }
}

export const wechatPay = new WechatPay({
  appid: process.env.WECHAT_APP_ID!,
  mchId: process.env.WECHAT_MCH_ID!,
  apiKey: process.env.WECHAT_API_KEY!,
  notifyUrl: process.env.WECHAT_NOTIFY_URL,
});