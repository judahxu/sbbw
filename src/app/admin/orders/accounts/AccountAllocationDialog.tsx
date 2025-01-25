'use client'
import React from 'react';
import { useState } from 'react';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import { Order, AccountAllocationData } from './types';
import { formatDateTime } from './utils';

interface Account {
  id: string;
  email: string;
  platform: string;
  type: string;
  status: string;
  createdAt: string;
}

interface AccountAllocationDialogProps {
  order: Order | null;
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: AccountAllocationData) => Promise<void>;
}

export const AccountAllocationDialog: React.FC<AccountAllocationDialogProps> = ({
  order,
  open,
  isLoading = false,
  onClose,
  onSubmit
}) => {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [allocationType, setAllocationType] = useState<'auto' | 'manual'>('auto');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock available accounts data
  // 实际项目中应该通过API获取
  const availableAccounts: Account[] = [
    {
      id: '1',
      email: 'account1@example.com',
      platform: 'chatgpt',
      type: 'permanent',
      status: 'in_stock',
      createdAt: new Date().toISOString()
    },
    // ... more accounts
  ];

  // 重置表单
  const resetForm = () => {
    setSearchQuery('');
    setAllocationType('auto');
    setSelectedAccount(null);
    setNote('');
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

      if (!selectedAccount && allocationType === 'manual') {
        setError('请选择要分配的账号');
        return;
      }

      await onSubmit({
        accountId: selectedAccount?.id || '',
        note
      });

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '分配失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 筛选账号
  const filteredAccounts = availableAccounts.filter(account => {
    if (!searchQuery) return true;
    return (
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.platform.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>分配账号 - {order?.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 订单信息 */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-gray-500">客户邮箱</Label>
              <div className="mt-1">{order?.customerEmail}</div>
            </div>

            <div>
              <Label className="text-gray-500">创建时间</Label>
              <div className="mt-1">
                {order ? formatDateTime(order.createdAt) : '-'}
              </div>
            </div>

            {order?.accountInfo && (
              <>
                <div>
                  <Label className="text-gray-500">账号要求</Label>
                  <div className="mt-1 space-x-2">
                    <Badge variant="outline">
                      {order.accountInfo.platform}
                    </Badge>
                    <Badge variant="outline">
                      {order.accountInfo.type === 'permanent' ? '永久' : '临时'}
                    </Badge>
                  </div>
                </div>

                {order.accountInfo.bundleType && (
                  <div>
                    <Label className="text-gray-500">套餐类型</Label>
                    <div className="mt-1">
                      {order.accountInfo.bundleType}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 分配方式 */}
          <div>
            <Label>分配方式</Label>
            <Select
              value={allocationType}
              onValueChange={(value: 'auto' | 'manual') => 
                setAllocationType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分配方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动分配</SelectItem>
                <SelectItem value="manual">手动选择</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 账号选择 */}
          {allocationType === 'manual' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>可用账号</Label>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="搜索账号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>账号</TableHead>
                      <TableHead>平台</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow
                        key={account.id}
                        className={selectedAccount?.id === account.id
                          ? 'bg-blue-50'
                          : undefined
                        }
                        onClick={() => setSelectedAccount(account)}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            checked={selectedAccount?.id === account.id}
                            onChange={() => setSelectedAccount(account)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell className="font-mono">
                          {account.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {account.platform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {account.type === 'permanent' ? '永久' : '临时'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(account.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* 分配备注 */}
          <div>
            <Label>分配备注</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="请输入分配备注信息"
              disabled={submitting}
            />
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
                分配中
              </>
            ) : '确认分配'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};