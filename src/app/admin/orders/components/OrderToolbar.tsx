// src/components/orders/OrderToolbar.tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Filter } from 'lucide-react';
import { OrderType, OrderStatus } from '../types';

interface OrderToolbarProps {
  onSearch: (query: string) => void;
  onTypeChange: (type: OrderType | 'all') => void;
  onStatusChange: (status: OrderStatus | 'all') => void;
  onExport: () => void;
  onAdvancedFilter: () => void;
}

export function OrderToolbar({
  onSearch,
  onTypeChange,
  onStatusChange,
  onExport,
  onAdvancedFilter
}: OrderToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="搜索订单..." 
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select defaultValue="all" onValueChange={onTypeChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="订单类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="acceleration">加速服务</SelectItem>
            <SelectItem value="appleId">美区账号</SelectItem>
            <SelectItem value="recharge">充值服务</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all" onValueChange={onStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="订单状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending_payment">待支付</SelectItem>
            <SelectItem value="paid">已支付</SelectItem>
            <SelectItem value="processing">处理中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="failed">失败</SelectItem>
          </SelectContent>
        </Select>

        {/* <Button variant="outline" onClick={onAdvancedFilter}>
          <Filter className="h-4 w-4 mr-2" />
          高级筛选
        </Button>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          导出数据
        </Button> */}
      </div>
    </div>
  );
}