'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  RefreshCw,
} from 'lucide-react';

interface OrderFiltersProps {
  searchQuery: string;
  orderStatus: string;
  version: string;
  duration: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onRefresh: () => void;
}

const OrderFilters = ({
  searchQuery,
  orderStatus,
  version,
  duration,
  onSearchChange,
  onStatusChange,
  onVersionChange,
  onDurationChange,
  onRefresh,
}: OrderFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="搜索订单号/用户..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 max-w-md"
        />
      </div>

      <Select value={orderStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="订单状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="pending">待开通</SelectItem>
          <SelectItem value="active">使用中</SelectItem>
          <SelectItem value="expired">已到期</SelectItem>
        </SelectContent>
      </Select>

      <Select value={version} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="加速器版本" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部版本</SelectItem>
          <SelectItem value="personal">个人版</SelectItem>
          <SelectItem value="team">团队版</SelectItem>
        </SelectContent>
      </Select>

      <Select value={duration} onValueChange={onDurationChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="服务时长" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部时长</SelectItem>
          <SelectItem value="1m">月付</SelectItem>
          <SelectItem value="3m">季付</SelectItem>
          <SelectItem value="12m">年付</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        导出
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4" />
        刷新
      </Button>
    </div>
  );
};

export default OrderFilters;