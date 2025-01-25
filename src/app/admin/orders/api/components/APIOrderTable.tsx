// components/APIOrderTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  Loader2,
} from 'lucide-react';
import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { APIOrder } from "../types";

interface APIOrderTableProps {
  orders: APIOrder[];
  isLoading: boolean;
  onShowDetail: (order: APIOrder) => void;
  onResetKey: (order: APIOrder) => void;
  onRecharge: (order: APIOrder) => void;
  onRenewal: (order: APIOrder) => void;
}

export function APIOrderTable({
  orders,
  isLoading,
  onShowDetail,
  onResetKey,
  onRecharge,
  onRenewal
}: APIOrderTableProps) {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [keyCopied, setKeyCopied] = useState<Record<string, boolean>>({});

  // API Key显示/隐藏切换
  const toggleApiKeyVisibility = (orderId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // 复制API Key
  const copyApiKey = async (orderId: string, apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setKeyCopied(prev => ({ ...prev, [orderId]: true }));
      setTimeout(() => {
        setKeyCopied(prev => ({ ...prev, [orderId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 状态标签样式
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      failed: '处理失败'
    };
    
    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  // API Key状态标签
  const getApiKeyStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      depleted: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      active: '使用中',
      warning: '即将耗尽',
      depleted: '已耗尽'
    };
    
    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  // 使用量展示
  const UsageDisplay = ({ order }: { order: APIOrder }) => {
    const { type, usage } = order;
    const percentage = type === 'token' 
      ? (usage.used / usage.total * 100)
      : null;
    const isWarning = percentage ? percentage > 90 : false;

    return (
      <div className="flex items-center gap-2">
        {type === 'token' ? (
          <>
            <span className={isWarning ? 'text-yellow-600' : ''}>
              {usage.used.toLocaleString()} / {usage.total.toLocaleString()} tokens
            </span>
            {isWarning && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>额度即将耗尽</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        ) : (
          <span className={usage.remainingDays <= 7 ? 'text-yellow-600' : ''}>
            剩余 {usage.remainingDays} 天
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>客户</TableHead>
            <TableHead>产品类型</TableHead>
            <TableHead>规格</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>API Key</TableHead>
            <TableHead>使用情况</TableHead>
            <TableHead>Key状态</TableHead>
            <TableHead>订单状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {order.type === 'token' ? 'Token包' : 'Key租用'}
                </Badge>
              </TableCell>
              <TableCell>{order.spec}</TableCell>
              <TableCell>
                ${formatCurrency(order.amountUsd)} /
                ¥{formatCurrency(order.amountCny)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="font-mono">
                    {showApiKey[order.id] ? 
                      order.apiKey : 
                      `${order.apiKey.slice(0, 8)}...`}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleApiKeyVisibility(order.id)}
                  >
                    {showApiKey[order.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyApiKey(order.id, order.apiKey)}
                  >
                    {keyCopied[order.id] ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <UsageDisplay order={order} />
              </TableCell>
              <TableCell>
                {getApiKeyStatusBadge(order.apiKeyStatus)}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{formatDateTime(order.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowDetail(order)}
                  >
                    详情
                  </Button>
                  {order.apiKeyStatus === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResetKey(order)}
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      重置Key
                    </Button>
                  )}
                  {order.type === 'token' && order.apiKeyStatus === 'warning' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecharge(order)}
                    >
                      充值
                    </Button>
                  )}
                  {order.type === 'rental' && order.usage.remainingDays <= 7 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRenewal(order)}
                    >
                      续期
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}