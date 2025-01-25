// src/components/orders/OrderTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '../types';
import { 
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
interface OrderTableProps {
  orders: Order[];
  onProcess: (order: Order) => void;
  onViewDetails: (order: Order) => void;
  onCancel: (order: Order) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export function OrderTable({ 
  orders,
  onProcess,
  onViewDetails,
  onCancel,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}: OrderTableProps) {
  // 获取状态对应的徽章样式
  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending_payment: { color: 'secondary', icon: Clock, text: '待支付' },
      paid: { color: 'default', icon: CheckCircle2, text: '已支付' },
      processing: { color: 'default', icon: Clock, text: '处理中' },
      completed: { color: 'success', icon: CheckCircle2, text: '已完成' },
      failed: { color: 'destructive', icon: AlertCircle, text: '失败' },
      cancelled: { color: 'outline', icon: Ban, text: '已取消' },
      refunded: { color: 'outline', icon: CheckCircle2, text: '已退款' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  // 获取订单类型显示
  const getOrderTypeDisplay = (type: Order['type']) => {
    const typeConfig = {
      acceleration: '加速服务',
      appleId: '美区账号',
      recharge: '充值服务'
    };

    return (
      <Badge variant="outline">
        {typeConfig[type]}
      </Badge>
    );
  };

  // 获取订单金额显示
  const getAmountDisplay = (order: Order) => {
    if (order.type === 'recharge') {
      return `¥${order.amount} (${order.usdAmount}$)`;
    }
    return `¥${order.amount}`;
  };

  // 判断是否可以处理订单
  const canProcessOrder = (order: Order) => {
    return order.status === 'paid' || order.status === 'failed';
  };

  // 判断是否可以取消订单
  const canCancelOrder = (order: Order) => {
    return ['pending_payment', 'paid'].includes(order.status);
  };

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);
  
  // 生成分页按钮
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // 始终显示第一页
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => onPageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // 计算显示的页码范围
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // 调整以确保显示足够的页码
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 2);
    }

    // 添加省略号和中间页码
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // 添加最后的省略号和最后一页
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // 页面大小选项
  const pageSizeOptions = [10, 20, 50, 100];

  return (
    <div className="space-y-4">
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单编号</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>用户</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{getOrderTypeDisplay(order.type)}</TableCell>
              <TableCell>{order.userEmail}</TableCell>
              <TableCell>{getAmountDisplay(order)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{new Date(order.createTime).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>订单操作</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canProcessOrder(order) && (
                      <DropdownMenuItem 
                        onClick={() => onProcess(order)}
                      >
                        处理订单
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onViewDetails(order)}
                    >
                      查看详情
                    </DropdownMenuItem>
                    {canCancelOrder(order) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onCancel(order)}
                          className="text-red-600"
                        >
                          取消订单
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
     <div className="flex items-center justify-between">
     <div className="flex items-center space-x-2">
       <span className="text-sm text-muted-foreground">每页显示</span>
       <select
         className="h-8 w-16 rounded-md border border-input bg-background px-2"
         value={pageSize}
         onChange={(e) => onPageSizeChange(Number(e.target.value))}
       >
         {pageSizeOptions.map((size) => (
           <option key={size} value={size}>
             {size}
           </option>
         ))}
       </select>
       <span className="text-sm text-muted-foreground">
         条，共 {total} 条记录
       </span>
     </div>

     <Pagination>
       <PaginationContent>
         <PaginationItem>
           <PaginationPrevious
             onClick={() => onPageChange(Math.max(1, currentPage - 1))}
             disabled={currentPage === 1}
           />
         </PaginationItem>
         
         {generatePaginationItems()}
         
         <PaginationItem>
           <PaginationNext
             onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
             disabled={currentPage === totalPages}
           />
         </PaginationItem>
       </PaginationContent>
     </Pagination>
   </div>
 </div>
  );
}