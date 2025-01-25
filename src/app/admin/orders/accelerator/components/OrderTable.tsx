'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, MoreVertical } from 'lucide-react';
import Pagination from './Pagination';
import { AcceleratorOrder } from '../utils';
import { 
  getVersionBadgeStyle, 
  getStatusBadgeStyle, 
  formatDateTime,
  formatAmount,
  isDeviceExceeded 
} from '../utils';
import { Loader2 } from "lucide-react";
import { formatDuration } from '../utils';
interface OrderTableProps {
  orders: AcceleratorOrder[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onManageDevices: (order: AcceleratorOrder) => void;
  onRenew: (order: AcceleratorOrder) => void;
}

const OrderTable = ({
  orders,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onManageDevices,
  onRenew,
}: OrderTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>客户信息</TableHead>
            <TableHead>版本</TableHead>
            <TableHead>服务时长</TableHead>
            <TableHead>设备使用</TableHead>
            <TableHead>订单金额</TableHead>
            <TableHead>服务状态</TableHead>
            <TableHead>服务期限</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <span>{order.id}</span>
                  {order.isBundle && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline">捆绑</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>账号捆绑订单</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customer}</div>
                  <div className="text-sm text-gray-500">{order.contactInfo}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getVersionBadgeStyle(order.version).style}>
                  {getVersionBadgeStyle(order.version).label}
                </Badge>
              </TableCell>
              <TableCell>{formatDuration(order.duration)}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={
                    isDeviceExceeded(order.currentDevices, order.deviceLimit)
                      ? "text-red-600"
                      : "text-gray-900"
                  }>
                    {order.currentDevices}/{order.deviceLimit}
                  </span>
                  {isDeviceExceeded(order.currentDevices, order.deviceLimit) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>设备数超出限制</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatAmount(order.amount)}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeStyle(order.status).style}>
                  {getStatusBadgeStyle(order.status).label}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{formatDateTime(order.startTime)}</div>
                  <div className="text-gray-500">至</div>
                  <div>{formatDateTime(order.endTime)}</div>
                </div>
              </TableCell>
              <TableCell>{formatDateTime(order.createTime)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onManageDevices(order)}
                  >
                    管理设备
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRenew(order)}
                  >
                    续期
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="py-4 border-t">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};

export default OrderTable;