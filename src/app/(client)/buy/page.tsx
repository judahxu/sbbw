'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import HomeLink from '../../components/HomeLink';
import { Loader2 } from 'lucide-react';
import { api } from "~/trpc/react";
import { Button } from "@/components/ui/button";
import WxPay from './WxPay';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function OrderConfirm() {
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | null>('wechat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Mock order data - in real app would come from previous page/API
  // const orderData = {
  //   productName: "ChatGPT永久账号套餐",
  //   details: "账号+180天加速器",
  //   price: 249,
  //   orderNumber: "ORD" + Date.now().toString().slice(-8)
  // };

   // 获取路由参数
   const type = searchParams.get('type'); // 'bundle' or 'custom'
   const id = searchParams.get('id');
   const config = searchParams.get('config');
 
   // 获取订单信息
   const { data: bundleData, isLoading: isBundleLoading } = api.bundle.detail.useQuery(
     { id: id! },
     { enabled: type === 'bundle' && !!id }
   );

 // 处理支付成功
  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    router.push('/payment/success'); // 跳转到支付成功页面
  };

  // 修改支付处理函数
  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('请选择支付方式');
      return;
    }
    setShowPaymentDialog(true);
  };


 
   // 创建订单mutation
   const createOrderMutation = api.order.create.useMutation({
     onSuccess: (data) => {
       // 创建订单成功后，发起支付
       handlePayment(data.orderId);
     },
     onError: (error) => {
       setError('创建订单失败：' + error.message);
       setLoading(false);
     }
   });
 
   // 发起支付mutation
   const createPaymentMutation = api.payment.create.useMutation({
     onSuccess: (data) => {
       // 根据支付方式处理支付流程
       if (data.paymentUrl) {
         window.location.href = data.paymentUrl;
       } else {
         // 展示支付二维码等
         console.log('Show payment QR code:', data.qrCode);
       }
       setLoading(false);
     },
     onError: (error) => {
       setError('发起支付失败：' + error.message);
       setLoading(false);
     }
   });
 
   // 准备订单数据
   const orderData = type === 'bundle' ? {
     productName: bundleData?.name || '',
     details: getOrderDetails(bundleData),
     price: bundleData?.salePrice || 0,
     orderNumber: "BUNDLE" + Date.now().toString()
   } : {
     productName: '自选配置',
     details: getCustomConfigDetails(config),
     price: calculateCustomPrice(config),
     orderNumber: "CUSTOM" + Date.now().toString()
   };
 
   // 处理支付
   const handleSubmit = async () => {
     if (!paymentMethod) {
       setError('请选择支付方式');
       return;
     }
 
     setLoading(true);
     setError('');
 
     // 创建订单
     createOrderMutation.mutate({
       type,
       bundleId: id,
       config: config ? JSON.parse(config) : undefined,
       paymentMethod,
     });
   };

   // 处理支付
  // const handlePayment = async (orderId: string) => {
  //   createPaymentMutation.mutate({
  //     orderId,
  //     method: paymentMethod,
  //   });
  // };

  // const handlePayment = async () => {
  //   if (!paymentMethod) {
  //     setError('请选择支付方式');
  //     return;
  //   }
  //   setLoading(true);
  //   setError('');
    
  //   try {
  //     // Here would be API call to initiate payment
  //     // const response = await callApi({
  //     //   url: '/api/payment/create',
  //     //   method: 'POST',
  //     //   body: { orderId: orderData.orderNumber, method: paymentMethod }
  //     // });
      
  //     // Mock API delay
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     // Redirect to success page
  //     router.push('/payment/success');
  //   } catch (err) {
  //     setError('支付创建失败，请重试');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (isBundleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex  flex-col items-center justify-start w-full">

      <div className="w-full max-w-2xl mt-16">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">订单确认</h1>
            
            {/* Order Details */}
            <div className="mb-8 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600 dark:text-gray-300">订单编号</span>
                <span className="font-mono">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600 dark:text-gray-300">商品名称</span>
                <span className="font-semibold">{orderData.productName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600 dark:text-gray-300">套餐详情</span>
                <span>{orderData.details}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>应付金额</span>
                <span className="text-red-500">￥{orderData.price}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">选择支付方式</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('wechat')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-colors
                    ${paymentMethod === 'wechat' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="w-8 h-8 mb-2 rounded-lg">
                    <img src="/images/wxpay.png" alt="" />
                  </div>
                  <span>微信支付</span>
                </button>
                {/* <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-colors
                    ${paymentMethod === 'alipay'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="w-8 h-8 mb-2 bg-gray-200 rounded-lg"></div>
                  <span>支付宝</span>
                </button> */}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePayment}
                disabled={loading || !paymentMethod}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </div>
                ) : (
                  '确认支付'
                )}  
              </Button>
            </div>
          </div>
        </div>

        {/* Terms and Privacy Notice */}
        <p className="text-center text-sm text-gray-500 mt-6">
          点击确认支付即表示您同意我们的
          <a href="/terms" className="text-blue-500 hover:underline">服务条款</a>
          和
          <a href="/privacy" className="text-blue-500 hover:underline">隐私政策</a>
        </p>
      </div>
      {/* 添加支付弹窗 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>请扫码支付</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <WxPay 
              orderId={orderData.orderNumber}
              amount={orderData.price * 100} // 转换为分
              description={orderData.details}
              onSuccess={handlePaymentSuccess}
            />
            <p className="mt-4 text-sm text-gray-500">
              请使用微信扫描二维码完成支付
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}


// 辅助函数
function getOrderDetails(bundleData: any) {
  if (!bundleData) return '';
  const details = [];
  if (bundleData.accountType === 'permanent') {
    details.push('永久账号');
  } else {
    details.push(`${bundleData.temporaryDuration}天账号`);
  }
  if (bundleData.plusDuration && bundleData.plusDuration != 'none') {
    details.push(`${bundleData.plusDuration}Plus`);
  }
  if (bundleData.acceleratorDuration && bundleData.acceleratorDuration != 'none') {
    details.push(`${bundleData.acceleratorDuration}加速器`);
  }
  return details.join(' + ');
}

function getCustomConfigDetails(config: string | null) {
  if (!config) return '';
  try {
    const configData = JSON.parse(config);
    return configData.selectedOptions
      .map((opt: any) => opt.label)
      .join(' + ');
  } catch (e) {
    return '';
  }
}

function calculateCustomPrice(config: string | null) {
  if (!config) return 0;
  try {
    const configData = JSON.parse(config);
    return configData.totalPrice || 0;
  } catch (e) {
    return 0;
  }
}