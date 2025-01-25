'use client'

import React ,{ useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Order, OrderProcessData } from './types';
import { formatDateTime } from './utils';

interface OrderProcessDialogProps {
  order: Order | null;
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: OrderProcessData) => Promise<void>;
}

export const OrderProcessDialog: React.FC<OrderProcessDialogProps> = ({
  order,
  open,
  isLoading = false,
  onClose,
  onSubmit
}) => {
  // 表单状态
  const [status, setStatus] = useState(order?.orderStatus || 'pending');
  const [note, setNote] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [operator, setOperator] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置表单
  const resetForm = () => {
    setStatus(order?.orderStatus || 'pending');
    setNote('');
    setFailureReason('');
    setOperator('');
    setError(null);
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 处理提交
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!order) return;

      // 验证表单
      if (status === 'failed' && !failureReason) {
        setError('请选择失败原因');
        return;
      }

      await onSubmit({
        status,
        note,
        operator,
        failureReason: status === 'failed' ? failureReason : undefined
      });

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 状态选项
  const statusOptions = [
    { value: 'processing', label: '处理中' },
    { value: 'completed', label: '已完成' },
    { value: 'failed', label: '处理失败' }
  ];

  // 失败原因选项
  const failureReasons = [
    { value: 'account_invalid', label: '账号无效' },
    { value: 'verification_needed', label: '需要验证' },
    { value: 'payment_issue', label: '支付问题' },
    { value: 'system_error', label: '系统错误' },
    { value: 'other', label: '其他原因' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>处理订单 - {order?.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 订单信息 */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-gray-500">创建时间</Label>
              <div className="mt-1">
                {order ? formatDateTime(order.createdAt) : '-'}
              </div>
            </div>
            <div>
              <Label className="text-gray-500">订单金额</Label>
              <div className="mt-1">
                ¥{order?.amountCny.toFixed(2)} / ${order?.amountUsd.toFixed(2)}
              </div>
            </div>
            <div>
              <Label className="text-gray-500">客户邮箱</Label>
              <div className="mt-1">{order?.customerEmail || '-'}</div>
            </div>
            <div>
              <Label className="text-gray-500">重试次数</Label>
              <div className="mt-1">
                {order?.processingInfo?.retryCount || 0}
              </div>
            </div>
          </div>

          {/* 处理表单 */}
          <div className="space-y-4">
            <div>
              <Label>处理状态</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择处理状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>处理人</Label>
              <Input
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="请输入处理人姓名"
                disabled={submitting}
              />
            </div>

            {status === 'failed' && (
              <div>
                <Label className="text-red-500">失败原因</Label>
                <Select
                  value={failureReason}
                  onValueChange={setFailureReason}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择失败原因" />
                  </SelectTrigger>
                  <SelectContent>
                    {failureReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>处理备注</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="请输入处理备注信息"
                disabled={submitting}
                rows={4}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中
              </>
            ) : '确认处理'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};