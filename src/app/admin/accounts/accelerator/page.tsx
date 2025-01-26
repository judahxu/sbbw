// src/app/admin/server-accounts/page.tsx
'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlusCircle, Upload } from 'lucide-react';
import { ServerAccountList } from './components/ServerAccountList';
import { CreateAccountDialog } from './components/CreateAccountDialog';
import { BatchImportDialog } from './components/BatchImportDialog';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

export default function ServerAccountsPage() {
  // 状态管理
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // TRPC Utils
  const utils = api.useUtils();

  // 获取账号列表
  const { data: accountsData, isLoading } = api.serverAccount.list.useQuery(
    {
      page,
      pageSize,
      searchName,
      status: status === 'all' ? undefined : status,
    },
    {
      keepPreviousData: true
    }
  );

  // 创建账号
  const { mutate: createAccount } = api.serverAccount.create.useMutation({
    onSuccess: () => {
      toast.success('创建成功');
      setShowCreateDialog(false);
      utils.serverAccount.list.invalidate();
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    }
  });

  // 删除账号
  const { mutate: deleteAccount } = api.serverAccount.delete.useMutation({
    onSuccess: () => {
      toast.success('删除成功');
      utils.serverAccount.list.invalidate();
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    }
  });

  // 批量导入
  const { mutate: batchImport } = api.serverAccount.batchImport.useMutation({
    onSuccess: (result) => {
      toast.success(`导入成功，共导入 ${result.count} 条数据`);
      setShowImportDialog(false);
      utils.serverAccount.list.invalidate();
    },
    onError: (error) => {
      toast.error(`导入失败: ${error.message}`);
    }
  });

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchName(value);
    setPage(1); // 重置到第一页
  };

  // 状态筛选处理
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1); // 重置到第一页
  };

  // 创建账号处理
  const handleCreate = (data: { name: string; config: string }) => {
    createAccount(data);
  };

  // 删除账号处理
  const handleDelete = (id: string) => {
    deleteAccount({ id });
  };

  // 批量导入处理
  const handleBatchImport = (accounts: Array<{ name: string; config: string }>) => {
    batchImport({ accounts });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">加速器账号管理</h1>
        <div className="space-x-2">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            新增账号
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowImportDialog(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            批量导入
          </Button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索账号名称"
                value={searchName}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                value={status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="账号状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="available">可分配</SelectItem>
                  <SelectItem value="assigned">已分配</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 账号列表 */}
      <ServerAccountList
        searchName={searchName}
        status={status}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onDelete={handleDelete}
        isLoading={isLoading}
        data={accountsData}
      />

      {/* 新增账号对话框 */}
      <CreateAccountDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
      />

      {/* 批量导入对话框 */}
      <BatchImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSubmit={handleBatchImport}
      />
    </div>
  );
}