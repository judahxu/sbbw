// src/app/admin/server-accounts/page.tsx
'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
import { PlusCircle, Download, Upload } from 'lucide-react';
import { ServerAccountList } from './components/ServerAccountList';
import { CreateAccountDialog } from './components/CreateAccountDialog';
import { BatchImportDialog } from './components/BatchImportDialog';

export default function ServerAccountsPage() {
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                value={status}
                onValueChange={setStatus}
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
          setPage(1); // 改变每页条数时重置为第一页
        }}
      />

      {/* 新增账号对话框 */}
      <CreateAccountDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* 批量导入对话框 */}
      <BatchImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
}