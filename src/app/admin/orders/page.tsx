'use client'
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, RefreshCcw } from 'lucide-react';

const OrderManagement = () => {
  // States for filters
  const [orderStatus, setOrderStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // Mock data for demonstration
  const orders = [
    {
      id: "ORD001",
      customer: "张三",
      product: "ChatGPT账号（永久）",
      amount: 299,
      status: "pending",
      paymentStatus: "paid",
      createTime: "2024-01-17 14:30",
    },
    {
      id: "ORD002",
      customer: "李四",
      product: "Plus账号（3个月）",
      amount: 799,
      status: "processing",
      paymentStatus: "paid",
      createTime: "2024-01-17 15:45",
    },
    // Add more mock orders...
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={`${statusStyles[status]} px-2 py-1 text-xs rounded-full`}>
        {getStatusText(status)}
      </Badge>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "待处理",
      processing: "处理中",
      completed: "已完成",
      cancelled: "已取消",
    };
    return statusMap[status];
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">订单管理</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">今日订单</h3>
            <p className="text-2xl font-bold">142</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">待处理</h3>
            <p className="text-2xl font-bold text-yellow-600">23</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">处理中</h3>
            <p className="text-2xl font-bold text-blue-600">15</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">已完成</h3>
            <p className="text-2xl font-bold text-green-600">104</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Select defaultValue="all" onValueChange={setOrderStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="订单状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select defaultValue="today" onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今天</SelectItem>
              <SelectItem value="yesterday">昨天</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="搜索订单号/用户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          导出
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">订单号</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>产品</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead>订单状态</TableHead>
              <TableHead>支付状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell className="text-right">￥{order.amount}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                    已支付
                  </Badge>
                </TableCell>
                <TableCell>{order.createTime}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderManagement;