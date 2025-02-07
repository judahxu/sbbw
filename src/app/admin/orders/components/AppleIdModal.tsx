// src/components/orders/modals/AppleIdModal.tsx
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
import { AppleIdOrder } from '../types';
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

interface AppleIdModalProps {
  open: boolean;
  order: AppleIdOrder;
  onClose: () => void;
  onConfirm: (data: { email: string; password: string; remark?: string }) => Promise<void>;
  onManualProcess?: () => void;
}

export function AppleIdModal({
  open,
  order,
  onClose,
  onConfirm,
  onManualProcess
}: AppleIdModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualAlert, setShowManualAlert] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm({ email, password, remark });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>分配美区账号</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 订单信息 */}
            <div className="space-y-1">
              <p className="text-sm font-medium">订单号：{order.id}</p>
              <p className="text-sm text-muted-foreground">
                用户邮箱：{order.userEmail}
              </p>
            </div>

            {/* 账号信息输入 */}
            <div className="space-y-2">
              <Label htmlFor="email">账号邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入 Apple ID 邮箱"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">账号密码</Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入账号密码"
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
                disabled={!email.trim() || !password.trim() || isSubmitting}
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
              转人工处理后，需要手动为用户创建新的美区账号。是否继续？
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