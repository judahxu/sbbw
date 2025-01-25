'use client';
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderHistory } from "./OrderHistory";

interface ProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSubmit: (data: any) => void;
}

export const ProcessingDialog = ({ 
  open, 
  onOpenChange, 
  order, 
  onSubmit 
}: ProcessingDialogProps) => {
  const [status, setStatus] = useState(order?.status);
  const [failureReason, setFailureReason] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setFailureReason('');
      setNote('');
    }
  }, [order]);

  const handleSubmit = () => {
    onSubmit({
      status,
      failureReason: status === 'failed' ? failureReason : undefined,
      note
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>更新处理进度</DialogTitle>
        </DialogHeader>
        
        {order && (
          <div className="space-y-4 pt-4">
            <div>
              <Label>当前状态</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">充值处理中</SelectItem>
                  <SelectItem value="retry_needed">需要重试</SelectItem>
                  <SelectItem value="completed">充值完成</SelectItem>
                  <SelectItem value="failed">充值失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(status === 'failed' || status === 'retry_needed') && (
              <div>
                <Label>失败原因</Label>
                <Select 
                  value={failureReason} 
                  onValueChange={setFailureReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择失败原因" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verification">需要验证码</SelectItem>
                    <SelectItem value="wrong_password">账号密码错误</SelectItem>
                    <SelectItem value="region_limit">地区限制</SelectItem>
                    <SelectItem value="other">其他原因</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>处理备注</Label>
              <Textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加处理备注..."
              />
            </div>

            <OrderHistory orderId={order.id} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>确认更新</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
