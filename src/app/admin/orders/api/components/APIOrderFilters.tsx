// components/APIOrderFilters.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface APIOrderFiltersProps {
  filters: {
    search: string;
    status: string;
  };
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function APIOrderFilters({
  filters,
  onSearch,
  onStatusChange
}: APIOrderFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="搜索订单号/用户邮箱..."
          value={filters.search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-8 max-w-md"
        />
      </div>

      <Select value={filters.status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="订单状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="pending">待处理</SelectItem>
          <SelectItem value="processing">处理中</SelectItem>
          <SelectItem value="completed">已完成</SelectItem>
          <SelectItem value="failed">处理失败</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="产品类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部类型</SelectItem>
          <SelectItem value="token">Token包</SelectItem>
          <SelectItem value="rental">Key租用</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="7d">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">最近7天</SelectItem>
          <SelectItem value="30d">最近30天</SelectItem>
          <SelectItem value="90d">最近90天</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}