// src/app/admin/server-accounts/components/CreateAccountDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RotateCw} from 'lucide-react';

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; config: string }) => void;
}

export function CreateAccountDialog({ 
  open, 
  onOpenChange,
  onSubmit
}: CreateAccountDialogProps) {
  // 表单状态
  const [name, setName] = useState('');
  const [config, setConfig] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单验证
  const validateForm = () => {
    if (!name.trim()) {
      setError('账号名称不能为空');
      return false;
    }
    if (!config.trim()) {
      setError('服务器配置不能为空');
      return false;
    }
    return true;
  };

  // 提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), config: config.trim() });
      // 重置表单
      setName('');
      setConfig('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 关闭对话框时重置状态
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('');
      setConfig('');
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增加速器账号</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 表单字段 */}
          <div className="space-y-2">
            <Label htmlFor="name">账号名称</Label>
            <Input
              id="name"
              placeholder="例如：🇸🇬 新加坡 01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config">服务器配置</Label>
            <Textarea
              id="config"
              placeholder="输入服务器配置信息"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认添加
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}