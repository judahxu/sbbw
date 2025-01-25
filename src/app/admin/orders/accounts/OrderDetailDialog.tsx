'use client'
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getOrderStatusStyle,
  getPaymentStatusStyle,
  getAllocationStatusStyle,
  formatDateTime,
  formatCurrency
} from './utils';
import { Order, OrderHistory } from './types';
import { Copy, Check } from 'lucide-react';

interface OrderDetailDialogProps {
  order: Order | null;
  history?: OrderHistory[];
  open: boolean;
  onClose: () => void;
}

export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  order,
  history = [],
  open,
  onClose
}) => {
  const [copied, setCopied] = React.useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!order) {
    return null;
  }

  const orderStatus = getOrderStatusStyle(order.orderStatus);
  const paymentStatus = getPaymentStatusStyle(order.paymentStatus);
  const allocationStatus = getAllocationStatusStyle(order.allocationStatus);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>订单详情 - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-gray-500">订单号</Label>
              <div className="mt-1 flex items-center space-x-2">
                <span>{order.orderNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopy(order.orderNumber, 'orderNumber')}
                >
                  {copied['orderNumber'] ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-gray-500">创建时间</Label>
              <div className="mt-1">{formatDateTime(order.createdAt)}</div>
            </div>

            <div>
              <Label className="text-gray-500">客户邮箱</Label>
              <div className="mt-1 flex items-center space-x-2">
                <span>{order.customerEmail}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopy(order.customerEmail, 'email')}
                >
                  {copied['email'] ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-gray-500">支付金额</Label>
              <div className="mt-1">
                <div>{formatCurrency(order.amountCny)}</div>
                <div className="text-sm text-gray-500">
                  ${order.amountUsd.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* 状态信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-500">订单状态</Label>
              <div className="mt-1">
                <Badge className={orderStatus.className}>
                  {orderStatus.label}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-gray-500">支付状态</Label>
              <div className="mt-1">
                <Badge className={paymentStatus.className}>
                  {paymentStatus.label}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-gray-500">分配状态</Label>
              <div className="mt-1">
                <Badge className={allocationStatus.className}>
                  {allocationStatus.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* 产品信息 */}
          {order.accountInfo && (
            <div className="space-y-4">
              <h3 className="font-medium">产品信息</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-500">平台</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {order.accountInfo.platform}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">账号类型</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {order.accountInfo.type === 'permanent' ? '永久' : '临时'}
                    </Badge>
                  </div>
                </div>

                {order.accountInfo.bundleType && (
                  <div className="col-span-2">
                    <Label className="text-gray-500">套餐类型</Label>
                    <div className="mt-1">
                      {order.accountInfo.bundleType}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 处理记录 */}
          {history.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">处理记录</h3>
              <div className="space-y-2">
                {history.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div>{record.content}</div>
                    <div className="text-gray-500">
                      {formatDateTime(record.createdAt)}
                      {record.operatorName && ` · ${record.operatorName}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 服务配置 */}
          {order.serviceConfig && (
            <div className="space-y-4">
              <h3 className="font-medium">服务配置</h3>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {order.serviceConfig.temporaryDays && (
                  <div>
                    <Label className="text-gray-500">使用时长</Label>
                    <div className="mt-1">
                      {order.serviceConfig.temporaryDays}天
                    </div>
                  </div>
                )}

                {order.serviceConfig.acceleratorDays && (
                  <div>
                    <Label className="text-gray-500">加速器时长</Label>
                    <div className="mt-1">
                      {order.serviceConfig.acceleratorDays}天
                    </div>
                  </div>
                )}

                {order.serviceConfig.plusMonths && (
                  <div>
                    <Label className="text-gray-500">Plus订阅</Label>
                    <div className="mt-1">
                      {order.serviceConfig.plusMonths}个月
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 处理信息 */}
          {order.processingInfo && (
            <div className="space-y-4">
              <h3 className="font-medium">处理信息</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-500">处理人</Label>
                  <div className="mt-1">
                    {order.processingInfo.operatorName || '-'}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">重试次数</Label>
                  <div className="mt-1">
                    {order.processingInfo.retryCount}
                  </div>
                </div>

                {order.processingInfo.lastProcessTime && (
                  <div>
                    <Label className="text-gray-500">最后处理时间</Label>
                    <div className="mt-1">
                      {formatDateTime(order.processingInfo.lastProcessTime)}
                    </div>
                  </div>
                )}

                {order.processingInfo.note && (
                  <div className="col-span-2">
                    <Label className="text-gray-500">处理备注</Label>
                    <div className="mt-1">
                      {order.processingInfo.note}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

