'use client'
import React from 'react';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus, OrderFilters as OrderFiltersType } from './types';
import { getDateRangeOptions } from './utils';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  isLoading?: boolean;
  onFilterChange: (filters: Partial<OrderFiltersType>) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  isLoading = false,
  onFilterChange,
  onRefresh,
  onExport
}) => {
  // 处理搜索输入防抖
  const [searchDebounced, setSearchDebounced] = React.useState(filters.search);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounced !== filters.search) {
        onFilterChange({ search: searchDebounced });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchDebounced]);

  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending_payment', label: '待付款' },
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'completed', label: '已完成' },
    { value: 'failed', label: '失败' },
    { value: 'cancelled', label: '已取消' }
  ];

  // 日期范围选项
  const dateRangeOptions = getDateRangeOptions();

  return (
    <div className="flex gap-4 mb-6 items-center">
      {/* 搜索框 */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="搜索订单号/用户邮箱..."
          value={searchDebounced}
          onChange={(e) => setSearchDebounced(e.target.value)}
          className="pl-8"
          disabled={isLoading}
        />
      </div>

      {/* 状态筛选 */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ status: value })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="订单状态" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 日期范围筛选 */}
      <Select
        value={filters.dateRange}
        onValueChange={(value) => onFilterChange({ dateRange: value })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 高级筛选按钮 */}
      <Button 
        variant="outline" 
        className="gap-2"
        disabled={isLoading}
        onClick={() => {
          // 实现高级筛选逻辑
        }}
      >
        <Filter className="h-4 w-4" />
        高级筛选
      </Button>

      {/* 刷新按钮 */}
      <Button
        variant="outline"
        className="gap-2"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        刷新
      </Button>

      {/* 导出按钮 */}
      <Button
        variant="outline"
        className="gap-2"
        onClick={onExport}
        disabled={isLoading}
      >
        <Download className="h-4 w-4" />
        导出
      </Button>
    </div>
  );
};