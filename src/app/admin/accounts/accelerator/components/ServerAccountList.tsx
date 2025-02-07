// src/app/admin/server-accounts/components/ServerAccountList.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Trash,Loader } from 'lucide-react';
// import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ServerAccountListProps {
  searchName: string;
  status: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  data?: {
    data: Array<{
      id: string;
      name: string;
      config: string;
      status: string;
      assignedTo?: string | null;
      assignmentStart?: Date | null; // 修改这里
      duration?: number | null; // 修改为 number | null
      assignmentEnd?: Date | null;
    }>;
    pagination: {
      total: number;
      totalPages: number;
    };
  };
}

export function ServerAccountList({ 
  searchName, 
  status, 
  page, 
  pageSize, 
  onPageChange, 
  onPageSizeChange,
  onDelete,
  isLoading,
  data
}: ServerAccountListProps) {
  const accounts = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">可分配</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-500">已分配</Badge>;
      case 'expired':
        return <Badge variant="destructive">已过期</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    );
  }

  if (!accounts.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无数据
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>服务器配置</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>分配用户</TableHead>
            <TableHead>开始时间</TableHead>
            <TableHead>时长(天)</TableHead>
            <TableHead>到期时间</TableHead>
            {/* <TableHead className="w-16">操作</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>{account.name}</TableCell>
              <TableCell className="font-mono text-sm max-w-32">
                {account.config}
              </TableCell>
              <TableCell>{getStatusBadge(account.status)}</TableCell>
              <TableCell>{account.assignedTo ?? '-'}</TableCell>
              <TableCell>{formatDate(account.assignmentStart ?? undefined)}</TableCell>              
              <TableCell>{account.duration ?? '-'}</TableCell>
              <TableCell>{formatDate(account.assignmentEnd ?? undefined)}</TableCell>
              {/* <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {account.status === 'expired' && (
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onDelete(account.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 分页控件 */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue>{pageSize} 条/页</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 条/页</SelectItem>
              <SelectItem value="20">20 条/页</SelectItem>
              <SelectItem value="50">50 条/页</SelectItem>
              <SelectItem value="100">100 条/页</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500">
            共 {data?.pagination.total ?? 0} 条
          </div>
        </div>

        {/* 页码 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            上一页
          </Button>
          <div className="flex items-center gap-1">
            <Input
              className="w-16 text-center"
              value={page}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0 && value <= totalPages) {
                  onPageChange(value);
                }
              }}
            />
            <span className="text-gray-500">/ {totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}