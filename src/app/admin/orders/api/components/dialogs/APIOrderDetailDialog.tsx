// components/dialogs/APIOrderDetailDialog.tsx
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { APIOrder } from "../../types";
import { formatDateTime, formatCurrency } from "@/lib/utils";

interface APIOrderDetailDialogProps {
  open: boolean;
  order: APIOrder | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string, note?: string) => void;
}

export function APIOrderDetailDialog({
  open,
  order,
  onClose,
  onUpdateStatus
}: APIOrderDetailDialogProps) {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [note, setNote] = useState('');

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>订单详情 - {order.orderNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <Label>客户邮箱</Label>
              <div className="mt-1">{order.customer}</div>
            </div>
            <div>
              <Label>产品类型</Label>
              <div className="mt-1">
                <Badge variant="outline">
                  {order.type === 'token' ? 'Token包' : 'Key租用'}
                </Badge>
              </div>
            </div>
            <div>
              <Label>订单金额</Label>
              <div className="mt-1">
                ${formatCurrency(order.amountUsd)} /
                ¥{formatCurrency(order.amountCny)}
              </div>
            </div>
            <div>
              <Label>创建时间</Label>
              <div className="mt-1">{formatDateTime(order.createdAt)}</div>
            </div>
          </div>

          {/* API Key信息 */}
          <div className="space-y-4">
            <div>
              <Label>API Key</Label>
              <div className="mt-1 font-mono">{order.apiKey}</div>
            </div>
            <div>
              <Label>使用情况</Label>
              <div className="mt-1">
                {order.type === 'token' ? (
                  <span>
                    {order.usage.used?.toLocaleString()} /
                    {order.usage.total?.toLocaleString()} tokens
                  </span>
                ) : (
                  <span>剩余 {order.usage.remainingDays} 天</span>
                )}
              </div>
            </div>
            <div>
              <Label>Key状态</Label>
              <div className="mt-1">
                <Badge 
                  className={
                    order.apiKeyStatus === 'active' ? 'bg-green-100 text-green-800' :
                    order.apiKeyStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {order.apiKeyStatus === 'active' ? '使用中' :
                   order.apiKeyStatus === 'warning' ? '即将耗尽' :
                   '已耗尽'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 状态更新 */}
        // components/dialogs/APIOrderDetailDialog.tsx (续)
        {/* 状态更新部分 */}
        <div className="mt-6 space-y-4">
          <div>
            <Label>更新状态</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">处理失败</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>处理备注</Label>
            <Input 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加处理备注信息..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={() => {
              onUpdateStatus(order.id, status, note);
              onClose();
            }}
          >
            确认更新
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}