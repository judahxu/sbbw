// src/app/admin/accounts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AccountImport } from './components/account-import';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, ChevronLeft, ChevronRight,Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Account, AccountStatus,PaginationState,toAccountStatus } from "./types";
// 账号状态类型


// 状态标签组件
const StatusBadge = ({ status }: { status: AccountStatus }) => {
  const variants = {
    [AccountStatus.AVAILABLE]: 'bg-green-100 text-green-800',
    [AccountStatus.SOLD]: 'bg-gray-100 text-gray-800',
    [AccountStatus.ABNORMAL]: 'bg-red-100 text-red-800',
  };
  
  const labels = {
    [AccountStatus.AVAILABLE]: '可售',
    [AccountStatus.SOLD]: '已售',
    [AccountStatus.ABNORMAL]: '异常',
  };

  return (
    <Badge className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

// 统计卡片组件
const StatsCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// 账号表单组件
const AccountForm = ({
  onSubmit,
  initialData
}: {
  onSubmit: (data: Omit<Account, 'id' | 'createdAt'>) => void;
  initialData?: Account;
}) => {
  const [formData, setFormData] = useState({
    email: initialData?.email ?? '',
    password: initialData?.password ?? '',
    status: initialData?.status ?? AccountStatus.AVAILABLE,
    orderId: initialData?.orderId ?? '',
    notes: initialData?.notes ?? ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="text"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">状态</Label>
        <Select
          value={formData.status}
          onValueChange={(value: AccountStatus) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AccountStatus.AVAILABLE}>可售</SelectItem>
            <SelectItem value={AccountStatus.SOLD}>已售</SelectItem>
            <SelectItem value={AccountStatus.ABNORMAL}>异常</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.status === AccountStatus.SOLD && (
        <div className="space-y-2">
          <Label htmlFor="orderId">订单号</Label>
          <Input
            id="orderId"
            type="text"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Input
          id="notes"
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button type="submit">
        {initialData ? '保存修改' : '创建账号'}
      </Button>
    </form>
  );
};

// 主页面组件


export default function AccountsPage() {
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    currentPage: 1,
    totalCount: 0,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { data, isLoading, refetch } = api.appleAccount.getAccounts.useQuery({
    pageSize: pagination.pageSize,
    currentPage: pagination.currentPage,
    email: emailFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter as AccountStatus,
  });

  const processedAccounts = data?.accounts.map(account => ({
    ...account,
    status: toAccountStatus(account.status),
    soldAt: account.soldAt ?? undefined,  // 将null转换为undefined
    orderId: account.orderId ?? undefined,  // 将null转换为undefined
    notes: account.notes ?? undefined  // 将null转换为undefined
  }));

  useEffect(() => {
    if (data) {
      setPagination(prev => ({ ...prev, totalCount: data.totalCount??0 }));
    }
  }, [data]);


  const handleSearch = (email: string) => {
    setEmailFilter(email);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // 统计数据
  const { data: statsData } = api.appleAccount.getStats.useQuery(undefined);

  // For creating account
  const { mutate: createAccount } = api.appleAccount.createAccount.useMutation({
    onSuccess: async () => {
      toast.success('账号创建成功');
      await refetch();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    }
  });

  // For updating account
  const { mutate: updateAccount } = api.appleAccount.updateAccount.useMutation({
    onSuccess: async () => {
      toast.success('账号更新成功');
      await refetch();
      setSelectedAccount(undefined);
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    }
  });

  // For batch importing
  const { mutate: batchImport } = api.appleAccount.batchImport.useMutation({
    onSuccess:async () => {
      toast.success('账号导入成功');
      await refetch();
      setIsImportDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`导入失败: ${error.message}`);
    }
  });

  const handleAddAccount = (data: Omit<Account, 'id' | 'createdAt'>) => {
    createAccount(data);
  };

  const handleEditAccount = (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!selectedAccount) return;
    
    updateAccount({
      id: selectedAccount.id,
      data
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="账号总数" value={statsData?.total ?? 0} />
        <StatsCard title="可用账号" value={statsData?.available ?? 0} />
        <StatsCard title="已售账号" value={statsData?.sold ?? 0} />
        <StatsCard title="异常账号" value={statsData?.abnormal ?? 0} />
      </div>

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增账号
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增账号</DialogTitle>
              </DialogHeader>
              <AccountForm onSubmit={handleAddAccount} />
            </DialogContent>
          </Dialog>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                导入账号
              </Button>
            </DialogTrigger>
            <AccountImport
              onImport={(importedAccounts) => {
                batchImport(importedAccounts);
              }}
              onClose={() => setIsImportDialogOpen(false)}
            />
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="搜索邮箱..." 
            value={emailFilter}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="available">可售</SelectItem>
              <SelectItem value="sold">已售</SelectItem>
              <SelectItem value="abnormal">异常</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 账号列表 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>密码</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>售出时间</TableHead>
              <TableHead>订单号</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : processedAccounts?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            processedAccounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.password}</TableCell>
                <TableCell>
                  <StatusBadge status={account.status} />
                </TableCell>
                <TableCell>{account.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>{account.soldAt?.toLocaleDateString()}</TableCell>
                <TableCell>{account.orderId}</TableCell>
                <TableCell>{account.notes}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAccount(account)}
                  >
                    编辑
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
          </TableBody>
        </Table>

        {/* 分页控件 */}
        <div className="py-4 px-6 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            共 {pagination.totalCount} 条记录
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage > 1) {
                      setPagination(prev => ({
                        ...prev,
                        currentPage: prev.currentPage - 1
                      }));
                    }
                  }}
                  className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from(
                { length: Math.ceil(pagination.totalCount / pagination.pageSize) },
                (_, i) => i + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPagination(prev => ({
                        ...prev,
                        currentPage: page
                      }));
                    }}
                    isActive={page === pagination.currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const maxPage = Math.ceil(pagination.totalCount / pagination.pageSize);
                    if (pagination.currentPage < maxPage) {
                      setPagination(prev => ({
                        ...prev,
                        currentPage: prev.currentPage + 1
                      }));
                    }
                  }}
                  className={
                    pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize) 
                      ? 'pointer-events-none opacity-50' 
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑账号</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <AccountForm
              initialData={selectedAccount}
              onSubmit={handleEditAccount}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}