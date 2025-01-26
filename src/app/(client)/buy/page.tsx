// src/app/(client)/buy/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import WxPay from './WxPay';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  type: 'acceleration' | 'appleId' | 'recharge';
  amount: number;
  status: string;
  product: {
    name: string;
    description: string;
  };
}

export default function OrderConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Get order details
  const { data: order, isLoading, error } = api.order.getDetails.useQuery(
    { orderId: orderId! },
    {
      enabled: !!orderId,
      retry: false,
      onError: (error) => {
        toast.error(`获取订单失败: ${error.message}`);
      }
    }
  );

  // Update order status
  const { mutate: updateOrderStatus } = api.order.updateStatus.useMutation({
    onSuccess: () => {
      setShowPaymentDialog(false);
      toast.success('支付成功');
      // Redirect to order detail page
      router.push(`/orders/${orderId}`);
    },
    onError: (error) => {
      toast.error(`更新订单状态失败: ${error.message}`);
    }
  });

  // Handle payment initiation
  const handlePayment = () => {
    if (!order.id) return;
    setShowPaymentDialog(true);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    if (!orderId) return;
    updateOrderStatus({ 
      orderId,
      status: 'paid'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || '订单不存在'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start w-full">
      <div className="w-full max-w-2xl mt-16">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">订单确认</h1>
            
            {/* Order Details */}
            <div className="mb-8 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">订单编号</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">商品名称</span>
                <span className="font-semibold">{order.product.name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">套餐详情</span>
                <span>{order.product.description}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>应付金额</span>
                <span className="text-red-500">￥{order.amount}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">支付方式</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg flex items-center justify-center border-green-500 bg-green-50">
                  <img src="/images/wxpay.png" alt="WeChat Pay" className="w-8 h-8 mr-2" />
                  <span>微信支付</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePayment}
                // disabled={loading || order.status !== 'pending_payment'}
                className="w-full md:w-auto"
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

        {/* Terms Notice */}
        <p className="text-center text-sm text-gray-500 mt-6">
          点击确认支付即表示您同意我们的
          <a href="/docs/terms" className="text-blue-500 hover:underline mx-1">服务条款</a>
          和
          <a href="/docs/privacy" className="text-blue-500 hover:underline mx-1">隐私政策</a>
        </p>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>请扫码支付</DialogTitle>
          </DialogHeader>
          {order && (
            <WxPay
              orderId={order.id}
              amount={Number(order.amount) * 100} // Convert to cents
              description={order.product.name}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}