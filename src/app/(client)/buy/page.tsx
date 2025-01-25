'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function OrderConfirmPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Mock order data - would come from previous page/API
  const orderData = {
    productName: "加速服务-季付套餐",
    details: "3个月加速服务",
    price: 99,
    orderNumber: "ORD" + Date.now().toString().slice(-8)
  };

  // Mock payment handling
  const handlePayment = () => {
    setShowPaymentDialog(true);
  };

  // Mock payment success
  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setPaymentStatus('success');
    // Would redirect to success page
  };

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
                <span className="font-mono">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">商品名称</span>
                <span className="font-semibold">{orderData.productName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">套餐详情</span>
                <span>{orderData.details}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>应付金额</span>
                <span className="text-red-500">￥{orderData.price}</span>
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
                disabled={loading}
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
          <div className="flex flex-col items-center p-6">
            {/* Mock QR Code */}
            <QRCodeSVG value={`mock_payment_url_${orderData.orderNumber}`} size={200} />
            <div className="mt-4 font-medium">
              支付金额：<span className="text-red-500">￥{orderData.price}</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              请使用微信扫描二维码完成支付
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}