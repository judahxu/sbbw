'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ManualProcessModalProps {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    type: 'recharge' | 'acceleration' | 'appleId';
    amount?: number;
    status: string;
    createTime: string;
    userEmail: string;
  };
}

const ManualProcessModal = ({ open, onClose, order }: ManualProcessModalProps) => {
  const handleProcess = async () => {
    // 处理逻辑
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>处理订单 #{order.id}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Badge className="mb-2">
                {order.type === 'recharge' && '充值服务'}
                {order.type === 'acceleration' && '加速服务'}
                {order.type === 'appleId' && '美区账号'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                创建时间：{order.createTime}
              </p>
              <p className="text-sm text-muted-foreground">
                用户邮箱：{order.userEmail}
              </p>
            </div>
            <Badge variant="secondary">{order.status}</Badge>
          </div>

          {order.type === 'recharge' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">充值码</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="输入礼品卡代码" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">处理备注</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="添加处理备注（可选）" />
                </div>
              </div>
            </div>
          )}

          {order.type === 'acceleration' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">加速器配置</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="输入配置信息" />
                </div>
              </div>
            </div>
          )}

          {order.type === 'appleId' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">账号信息</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="输入账号" />
                </div>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="输入密码" type="password" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleProcess}>
              确认提交
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualProcessModal;