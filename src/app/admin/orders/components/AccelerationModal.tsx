// src/components/orders/modals/AccelerationModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AccelerationOrder } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AccelerationModalProps {
  open: boolean;
  order: AccelerationOrder;
  onClose: () => void;
  onConfirm: (data: { 
    server: string; 
    remark?: string 
  }) => Promise<void>;
  onManualProcess?: () => void;
}

export function AccelerationModal({
  open,
  order,
  onClose,
  onConfirm,
  onManualProcess
}: AccelerationModalProps) {
  const [server, setServer] = useState('');
  const [port, setPort] = useState('');
  const [password, setPassword] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualAlert, setShowManualAlert] = useState(false);

  const handleSubmit = async () => {
    if (!server.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm({
        server: server.trim(),
        remark
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanDisplay = (plan: AccelerationOrder['plan']) => {
    const planMap = {
      monthly: '月付',
      quarterly: '季付',
      yearly: '年付'
    };
    return planMap[plan];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>分配加速服务配置</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 订单信息 */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium">订单号：{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  用户邮箱：{order.userEmail}
                </p>
              </div>
              <Badge>
                {getPlanDisplay(order.plan)}
              </Badge>
            </div>

            {/* 配置信息输入 */}
            <div className="space-y-2">
              <Label htmlFor="server">配置信息</Label>
              <Input
                id="server"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="输入配置信息"
              />
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="remark">处理备注</Label>
              <Textarea
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="添加处理备注（可选）"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            {/* <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowManualAlert(true)}
                disabled={isSubmitting}
              >
                转人工处理
              </Button>
            </div> */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!server.trim() || isSubmitting}
              >
                {isSubmitting ? '处理中...' : '确认提交'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <AlertDialog open={showManualAlert} onOpenChange={setShowManualAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认转人工处理？</AlertDialogTitle>
            <AlertDialogDescription>
              转人工处理后，需要手动配置加速服务。是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowManualAlert(false);
              onClose();
              onManualProcess?.();
            }}>
              确认转人工
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
}