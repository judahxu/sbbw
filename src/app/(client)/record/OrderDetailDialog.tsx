// src/app/(client)/orders/components/OrderDetailDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Eye, 
  EyeOff,
  RefreshCw,
  MessageCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import type { Order, AccelerationOrder, AppleIdOrder, RechargeOrder } from '~/lib/types/orders';

interface OrderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order & {
    accelerationOrder?: AccelerationOrder;
    appleIdOrder?: AppleIdOrder;
    rechargeOrder?: RechargeOrder;
    product: {
      name: string;
    };
  };
  isLoading?: boolean;
}

interface StatusInfo {
  label: string;
  className: string;
}

const STATUS_MAP: Record<string, StatusInfo> = {
  'pending_payment': { label: '待支付', className: 'bg-yellow-100 text-yellow-800' },
  'paid': { label: '已支付', className: 'bg-blue-100 text-blue-800' },
  'processing': { label: '处理中', className: 'bg-blue-100 text-blue-800' },
  'completed': { label: '已完成', className: 'bg-green-100 text-green-800' },
  'failed': { label: '失败', className: 'bg-red-100 text-red-800' },
  'cancelled': { label: '已取消', className: 'bg-gray-100 text-gray-800' },
  'refunded': { label: '已退款', className: 'bg-gray-100 text-gray-800' }
};

const getStatusBadge = (status: string): JSX.Element => {
  const statusInfo = STATUS_MAP[status] ?? { 
    label: status, 
    className: 'bg-gray-100 text-gray-800' 
  };
  
  return (
    <Badge className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  );
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString('zh-CN');
};

export function OrderDetailDialog({ 
  open, 
  onClose, 
  order, 
  isLoading = false 
}: OrderDetailDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type}已复制到剪贴板`);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleRenewService = () => {
    router.push(`/product?renew=${order.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const renderAppleIdDetails = (appleIdOrder: AppleIdOrder) => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">账号信息</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">账号邮箱</span>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded">
                {appleIdOrder.email}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(appleIdOrder.email!, '账号')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">账号密码</span>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded">
                {showPassword ? appleIdOrder.password : '••••••••'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(appleIdOrder.password!, '密码')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          使用提示
        </h3>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• 首次登录后请及时修改密码</li>
          <li>• 请勿在设备间频繁切换登录</li>
          <li>• 遇到登录问题请联系客服</li>
        </ul>
      </div>
    </div>
  );

  const renderAccelerationDetails = (accelerationOrder: AccelerationOrder) => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">服务配置</h3>
        <div className="space-y-2">
          {accelerationOrder.configuration && (
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(accelerationOrder.configuration, null, 2)}
            </pre>
          )}
        </div>
        <div className="space-y-2">
          <Button
            className="w-full mt-2"
            onClick={() => copyToClipboard(
              JSON.stringify(accelerationOrder.configuration),
              '配置信息'
            )}
          >
            <Copy className="w-4 h-4 mr-2" />
            复制完整配置
          </Button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">服务期限</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">开始时间</span>
            <span>{accelerationOrder?.startDate ? formatDate(accelerationOrder?.startDate):'-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">到期时间</span>
            <span>{accelerationOrder?.endDate ? formatDate(accelerationOrder?.endDate):'-'}</span>
          </div>
          {/* {accelerationOrder?.endDate && new Date(accelerationOrder?.endDate) > new Date() && (
            <Button
              className="w-full mt-2"
              variant="outline"
              onClick={handleRenewService}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              续费服务
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );

  const renderRechargeDetails = (rechargeOrder: RechargeOrder) => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">充值详情</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">充值金额</span>
            <span>${rechargeOrder.usdAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">汇率</span>
            <span>{rechargeOrder.exchangeRate}</span>
          </div>
          {rechargeOrder.giftCardCode && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">礼品卡代码</span>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {rechargeOrder.giftCardCode}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderServiceDetails = () => {
    switch (order.type) {
      case 'appleId':
        return order.appleIdOrder && renderAppleIdDetails(order.appleIdOrder);
      case 'acceleration':
        return order.accelerationOrder && renderAccelerationDetails(order.accelerationOrder);
      case 'recharge':
        return order.rechargeOrder && renderRechargeDetails(order.rechargeOrder);
      default:
        return null;
    }
  };

  const openSupportEmail = () => {
    const mailtoLink = `mailto:seebigbigworldx@gmail.com?subject=${encodeURIComponent(
      `[技术支持] ${order.product.name} - 订单 ${order.id}`
    )}&body=${encodeURIComponent(
      `订单号：${order.id}\n` +
      `服务类型：${order.product.name}\n` +
      `问题描述：\n\n` +
      `---\n` +
      `时间：${new Date().toLocaleString()}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">订单编号：{order.id}</p>
              <h2 className="text-xl font-bold mt-1">{order.product.name}</h2>
            </div>
            {getStatusBadge(order.status)}
          </div>

          {renderServiceDetails()}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <p>创建时间：{order.createdAt?formatDate(order.createdAt):'-'}</p>
                {order.processedAt && (
                  <p>处理时间：{formatDate(order.processedAt)}</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={openSupportEmail}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                联系客服
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}