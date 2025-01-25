// src/components/orders/modals/RechargeModal.tsx
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RechargeOrder } from '@/types/orders';

interface RechargeModalProps {
  open: boolean;
  order: RechargeOrder;
  onClose: () => void;
  onConfirm: (giftCardCode: string, remark: string) => Promise<void>;
}

export function RechargeModal({
  open,
  order,
  onClose,
  onConfirm
}: RechargeModalProps) {
  const [giftCardCode, setGiftCardCode] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!giftCardCode.trim()) {
      // 可以添加错误提示
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(giftCardCode, remark);
      onClose();
    } catch (error) {
      // 可以添加错误处理
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>处理充值订单</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 订单信息 */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium">订单号：{order.id}</p>
              <p className="text-sm text-muted-foreground">
                用户邮箱：{order.userEmail}
              </p>
              <p className="text-sm text-muted-foreground">
                充值账号：{order.appliedAccount}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${order.usdAmount}</p>
              <p className="text-sm text-muted-foreground">
                ¥{order.amount}
              </p>
            </div>
          </div>

          {/* 充值码输入 */}
          <div className="space-y-2">
            <Label htmlFor="giftCardCode">礼品卡充值码</Label>
            <Input
              id="giftCardCode"
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value)}
              placeholder="输入礼品卡代码"
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
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!giftCardCode.trim() || isSubmitting}
          >
            {isSubmitting ? '处理中...' : '确认提交'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}