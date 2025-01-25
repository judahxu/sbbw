// src/app/admin/accounts/page.tsx
'use client';

import { useState } from 'react';
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
import { Plus, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// 账号状态类型
export enum AccountStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  ABNORMAL = 'abnormal'
}

// 账号类型定义
interface Account {
  id: string;
  email: string;
  password: string;
  status: AccountStatus;
  createdAt: Date;
  soldAt?: Date;
  orderId?: string;
  notes?: string;
}

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
    email: initialData?.email || '',
    password: initialData?.password || '',
    status: initialData?.status || AccountStatus.AVAILABLE,
    orderId: initialData?.orderId || '',
    notes: initialData?.notes || ''
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
interface PaginationState {
  pageSize: number;
  currentPage: number;
  totalCount: number;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]); // 实际应用中通过API获取
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    currentPage: 1,
    totalCount: 0,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // 统计数据
  const stats = {
    total: accounts.length,
    available: accounts.filter(a => a.status === AccountStatus.AVAILABLE).length,
    sold: accounts.filter(a => a.status === AccountStatus.SOLD).length,
    abnormal: accounts.filter(a => a.status === AccountStatus.ABNORMAL).length
  };

  const handleAddAccount = (data: Omit<Account, 'id' | 'createdAt'>) => {
    // 实际应用中通过API创建
    const newAccount: Account = {
      id: Date.now().toString(),
      createdAt: new Date(),
      ...data
    };
    setAccounts([...accounts, newAccount]);
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1
    }));
    setIsAddDialogOpen(false);
  };

  const handleEditAccount = (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!selectedAccount) return;
    
    // 实际应用中通过API更新
    const updatedAccounts = accounts.map(account =>
      account.id === selectedAccount.id
        ? { ...account, ...data }
        : account
    );
    setAccounts(updatedAccounts);
    setSelectedAccount(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="账号总数" value={stats.total} />
        <StatsCard title="可用账号" value={stats.available} />
        <StatsCard title="已售账号" value={stats.sold} />
        <StatsCard title="异常账号" value={stats.abnormal} />
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
                const newAccounts = importedAccounts.map(data => ({
                  id: Date.now().toString(),
                  createdAt: new Date(),
                  ...data
                }));
                setAccounts([...accounts, ...newAccounts]);
                setIsImportDialogOpen(false);
              }}
              onClose={() => setIsImportDialogOpen(false)}
            />
          </Dialog>
        </div>

        {/* <div className="flex gap-2">
          <Input placeholder="搜索邮箱..." className="w-64" />
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部</SelectItem>
              <SelectItem value={AccountStatus.AVAILABLE}>可售</SelectItem>
              <SelectItem value={AccountStatus.SOLD}>已售</SelectItem>
              <SelectItem value={AccountStatus.ABNORMAL}>异常</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
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
            {accounts
              .slice(
                (pagination.currentPage - 1) * pagination.pageSize,
                pagination.currentPage * pagination.pageSize
              )
              .map((account) => (
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
            ))}
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
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
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