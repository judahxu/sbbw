'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface WxPayProps {
  orderId: string;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

export default function WxPay({ orderId, amount, description, onSuccess }: WxPayProps) {
  const [qrUrl, setQrUrl] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    async function createOrder() {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          description,
        }),
      });
      const data = await res.json();
      setQrUrl(data.codeUrl);
    }
    createOrder();
  }, [orderId, amount, description]);

  useEffect(() => {
    if (!qrUrl) return;
    
    const timer = setInterval(async () => {
      const res = await fetch(`/api/pay/status?orderId=${orderId}`);
      const { status } = await res.json();
      if (status === 'SUCCESS') {
        setStatus('success');
        clearInterval(timer);
        onSuccess?.(); // 调用成功回调
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [qrUrl, orderId, onSuccess]);

  return (
    <div className="text-center p-6">
      {qrUrl && (
        <div className="flex flex-col items-center">
          <QRCodeSVG value={qrUrl} size={200} />
          <div className="mt-4 font-medium">
            支付金额：<span className="text-red-500">￥{amount / 100}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {status === 'pending' && '等待支付...'}
            {status === 'success' && '支付成功!'}
          </div>
        </div>
      )}
    </div>
  );
}