'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, ExternalLink, AlertCircle } from 'lucide-react';

// 假设这些数据来自API
const mockOrders = {
  active: [
    {
      id: "ORD001",
      type: "permanent",
      product: "ChatGPT账号（永久）",
      productDetail: {
        account: "user123@example.com",
        password: "********",
        additions: ["365天加速器"]
      },
      amount: 399,
      status: "active",
      createTime: "2024-01-15",
      expiryTime: null,
    },
    {
      id: "ORD002",
      type: "plus",
      product: "Plus会员（3个月）",
      productDetail: {
        account: "user123@example.com",
        startDate: "2024-01-15",
        endDate: "2024-04-15"
      },
      amount: 799,
      status: "active",
      createTime: "2024-01-15",
      expiryTime: "2024-04-15",
    }
  ],
  completed: [
    {
      id: "ORD003",
      type: "temporary",
      product: "ChatGPT临时账号（15天）",
      productDetail: {
        account: "temp456@example.com",
        password: "********",
        additions: ["15天加速器"]
      },
      amount: 35.9,
      status: "expired",
      createTime: "2023-12-01",
      expiryTime: "2023-12-16",
    }
  ],
  processing: [
    {
      id: "ORD004",
      type: "api",
      product: "API充值（$20）",
      productDetail: {
        amount: "$20",
        rate: "1:6.9",
        serviceFee: "4%"
      },
      amount: 138,
      status: "processing",
      createTime: "2024-01-17",
      expiryTime: null,
    }
  ]
};

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      processing: "bg-blue-100 text-blue-800",
    };
    
    const labels = {
      active: "使用中",
      expired: "已过期",
      processing: "处理中",
    };

    return (
      <Badge className={`${styles[status]} px-2 py-1`}>
        {labels[status]}
      </Badge>
    );
  };

  const renderOrderDetail = (order) => {
    const details = order.productDetail;
    
    switch(order.type) {
      case 'permanent':
      case 'temporary':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">账号:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">{details.account}</code>
            </div>
            {details.additions?.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">附加服务:</span>
                <div className="flex gap-1">
                  {details.additions.map((addition, idx) => (
                    <Badge key={idx} variant="secondary">{addition}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <Button size="sm" variant="outline">
                查看密码
              </Button>
              <Button size="sm" variant="outline">
                复制账号
              </Button>
            </div>
          </div>
        );
      
      case 'plus':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">绑定账号:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">{details.account}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">有效期:</span>
              <span>{details.startDate} 至 {details.endDate}</span>
            </div>
            {new Date(details.endDate) > new Date() && (
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline">
                  续费会员
                </Button>
              </div>
            )}
          </div>
        );
      
      case 'api':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">充值金额:</span>
              <span>{details.amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">汇率:</span>
              <span>{details.rate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">服务费:</span>
              <span>{details.serviceFee}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <p className="text-gray-500 mt-1">查看和管理您的所有订单</p>
      </div>

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索订单号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="订单类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="permanent">永久账号</SelectItem>
            <SelectItem value="temporary">临时账号</SelectItem>
            <SelectItem value="plus">Plus会员</SelectItem>
            <SelectItem value="api">API充值</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            <SelectItem value="1m">最近一个月</SelectItem>
            <SelectItem value="3m">最近三个月</SelectItem>
            <SelectItem value="1y">最近一年</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          高级筛选
        </Button>
      </div>

      {/* 订单列表 */}
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">使用中</TabsTrigger>
          <TabsTrigger value="processing">处理中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>

        {Object.entries({
          active: mockOrders.active,
          processing: mockOrders.processing,
          completed: mockOrders.completed,
        }).map(([tab, orders]) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">订单号: {order.id}</p>
                        <CardTitle className="mt-1">{order.product}</CardTitle>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">￥{order.amount}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderOrderDetail(order)}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-gray-500">
                      <div className="space-x-4">
                        <span>创建时间: {order.createTime}</span>
                        {order.expiryTime && (
                          <span>到期时间: {order.expiryTime}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          技术支持
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          订单详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrdersPage;