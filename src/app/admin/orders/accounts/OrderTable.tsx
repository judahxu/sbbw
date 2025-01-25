
'use client'
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getOrderStatusStyle, 
  getAllocationStatusStyle, 
  getPaymentStatusStyle,
  formatDateTime,
  formatCurrency 
} from './utils';
import { Order } from './types';
import {
  Eye,
  Copy,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (order: Order) => void;
  onProcess: (order: Order) => void;
  onAllocate: (order: Order) => void;
}

const OrderTableRow: React.FC<{ 
  order: Order;
  onViewDetails: () => void;
  onProcess: () => void;
  onAllocate: () => void;
}> = ({ order, onViewDetails, onProcess, onAllocate }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const orderStatus = getOrderStatusStyle(order.orderStatus);
  const paymentStatus = getPaymentStatusStyle(order.paymentStatus);
  const allocationStatus = getAllocationStatusStyle(order.allocationStatus);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <span>{order.orderNumber}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleCopy(order.orderNumber)}
          >
            {copied ? (
              <span className="text-green-500 text-xs">已复制</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col space-y-1">
          <span>{order.customerEmail}</span>
          {order.customer && (
            <span className="text-sm text-gray-500">{order.customer}</span>
          )}
        </div>
      </TableCell>

      <TableCell>
        {order.accountInfo && (
          <div className="flex flex-col space-y-1">
            <Badge variant="outline">{order.accountInfo.platform}</Badge>
            <Badge variant="outline">
              {order.accountInfo.type === 'permanent' ? '永久' : '临时'}
            </Badge>
            {order.accountInfo.bundleType && (
              <span className="text-sm text-gray-500">
                {order.accountInfo.bundleType}
              </span>
            )}
          </div>
        )}
      </TableCell>

      <TableCell>
        <div className="flex flex-col space-y-1">
          <span>{formatCurrency(order.amountCny)}</span>
          <span className="text-sm text-gray-500">
            ${order.amountUsd.toFixed(2)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <Badge className={paymentStatus.className}>
          {paymentStatus.label}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge className={orderStatus.className}>
          {orderStatus.label}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge className={allocationStatus.className}>
          {allocationStatus.label}
        </Badge>
      </TableCell>

      <TableCell>
        {formatDateTime(order.createdAt)}
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4 mr-1" />
            详情
          </Button>

          {order.orderStatus === 'pending' && (
            <Button
              variant="default"
              size="sm"
              onClick={onProcess}
            >
              处理
            </Button>
          )}

          {order.allocationStatus === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAllocate}
            >
              分配账号
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  onViewDetails,
  onProcess,
  onAllocate
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-gray-500">
        暂无数据
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>客户信息</TableHead>
            <TableHead>产品信息</TableHead>
            <TableHead>订单金额</TableHead>
            <TableHead>支付状态</TableHead>
            <TableHead>订单状态</TableHead>
            <TableHead>分配状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrderTableRow
              key={order.id}
              order={order}
              onViewDetails={() => onViewDetails(order)}
              onProcess={() => onProcess(order)}
              onAllocate={() => onAllocate(order)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};