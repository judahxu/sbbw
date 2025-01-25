'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Download,
  RefreshCw,
  Copy,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from "~/trpc/react";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


const PlusRechargeOrders = () => {
  const [orderStatus, setOrderStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderModal, setOrderModal] = useState({ open: false, order: null });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [processingDialog, setProcessingDialog] = useState({ open: false, order: null });
  const queryClient = useQueryClient();

  // 获取订单列表
  const { data: ordersData, isLoading } = api.order.list.useQuery(
    {
      type: 'plus_recharge',
      status: orderStatus !== 'all' ? orderStatus : undefined,
      search: searchQuery,
      page,
      pageSize,
    }
  );

  // 获取统计数据
  const { data: statsData } = api.order.getStats.useQuery({
    type: 'plus_recharge'
  });

  // 更新处理进度
  const updateProgressMutation = api.order.updatePlusRechargeProgress.useMutation({
    onSuccess: () => {
      toast.success('进度更新成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
      void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
    },
    onError: (error) => {
      toast.error(error.message || '更新失败');
    }
  });

  // 获取订单历史
  const { data: orderHistory } = api.order.getHistory.useQuery(
    { orderId: selectedOrder?.id },
    { enabled: !!selectedOrder }
  );

  // 处理进度更新
  const handleUpdateProgress = async (data) => {
    const { orderId, status, failureReason, note } = data;
    try {
      await updateProgressMutation.mutateAsync({
        orderId,
        status,
        failureReason,
        note,
        metadata: {
          // 额外的元数据
        }
      });
      setProcessingDialog({ open: false, order: null });
    } catch (error) {
      console.error('更新处理进度失败:', error);
    }
  };

  // Mock orders data
  const orders = [
    {
      id: "ORD001",
      customer: "user1@example.com",
      contact: "微信: user123",
      amount_usd: 20,
      amount_cny: 138,
      status: "pending_payment",
      payment_method: "alipay",
      created_at: "2024-01-20 14:30",
      account: {
        email: "plus1@openai.com",
        password: "pass123",
      },
      subscription: "1个月",
      operator: null,
      note: "",
      retry_count: 0,
      history: [
        {
          time: "2024-01-20 14:30",
          content: "订单创建",
          operator: "系统"
        }
      ]
    },
    {
      id: "ORD002",
      customer: "user2@example.com",
      contact: "电话: 13588889999",
      amount_usd: 60,
      amount_cny: 414,
      status: "processing",
      payment_method: "wechat",
      created_at: "2024-01-20 15:45", 
      account: {
        email: "plus2@openai.com",
        password: "pass456",
      },
      subscription: "3个月",
      operator: "客服001",
      note: "需要验证码，已联系用户",
      retry_count: 1,
      history: [
        {
          time: "2024-01-20 15:45",
          content: "订单创建",
          operator: "系统"
        },
        {
          time: "2024-01-20 15:50",
          content: "开始处理充值",
          operator: "客服001"
        },
        {
          time: "2024-01-20 15:55",
          content: "需要验证码，已联系用户",
          operator: "客服001"
        }
      ]
    }
  ];

  // Mock stats
  const stats = {
    today: {
      orders: 28,
      amount_usd: 560,
      amount_cny: 3864
    },
    processing: 12,
    success_rate: 95.5
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      pending_payment: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      retry_needed: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };

    const labels = {
      pending_payment: "待付款",
      processing: "充值中",
      retry_needed: "需要重试",
      completed: "已完成", 
      failed: "充值失败"
    };

    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plus充值订单</h1>
          <p className="text-gray-500">管理和处理Plus充值订单</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">今日订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{stats.today.orders}</div>
              <div className="text-sm text-muted-foreground">
                ${stats.today.amount_usd} / ¥{stats.today.amount_cny}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">处理中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">充值成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.success_rate}%</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12分钟</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索订单号/用户邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-md"
          />
        </div>

        <Select value={orderStatus} onValueChange={setOrderStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="订单状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending_payment">待付款</SelectItem>
            <SelectItem value="processing">充值中</SelectItem>
            <SelectItem value="retry_needed">需要重试</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="failed">充值失败</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="处理人" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="unassigned">未分配</SelectItem>
            <SelectItem value="op1">客服001</SelectItem>
            <SelectItem value="op2">客服002</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          导出
        </Button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>OpenAI账号</TableHead>
              <TableHead>联系方式</TableHead>
              <TableHead>充值金额</TableHead>
              <TableHead>订阅时长</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>处理人</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.account.email}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{order.contact}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>${order.amount_usd} / ¥{order.amount_cny}</TableCell>
                <TableCell>{order.subscription}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{order.operator || '-'}</TableCell>
                <TableCell>{order.created_at}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setOrderModal({ open: true, order })}
                  >
                    处理
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Processing Dialog */}
      <Dialog 
        open={orderModal.open}
        onOpenChange={(open) => setOrderModal({ open, order: open ? orderModal.order : null })}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>订单处理 - {orderModal.order?.id}</DialogTitle>
            <DialogDescription>
              查看订单详情并更新处理进度
            </DialogDescription>
          </DialogHeader>
          
          {orderModal.order && (
            <div className="space-y-4 pt-4">
              {/* Account Info */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>OpenAI账号</Label>
                    <div className="flex items-center mt-1 space-x-2">
                      <code className="flex-1 p-1 rounded bg-gray-50">
                        {orderModal.order.account.email}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>账号密码</Label>
                    <div className="flex items-center mt-1 space-x-2">
                      <code className="flex-1 p-1 rounded bg-gray-50">
                        {orderModal.order.account.password}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>联系方式</Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <code className="flex-1 p-1 rounded bg-gray-50">
                      {orderModal.order.contact}
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>订阅时长</Label>
                  <div className="mt-2">{orderModal.order.subscription}</div>
                </div>
              </div>

              {/* Processing History */}
              <div className="border rounded-lg p-4">
                <Label>处理记录</Label>
                <div className="mt-2 space-y-2">
                  {orderModal.order.history.map((record, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">{record.content}</span>
                      <span className="text-gray-400">{record.time} · {record.operator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>更新状态</Label>
                  <Select defaultValue={orderModal.order.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">充值处理中</SelectItem>
                      <SelectItem value="retry_needed">需要重试</SelectItem>
                      <SelectItem value="completed">充值成功</SelectItem>
                      <SelectItem value="failed">充值失败</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>处理人</Label>
                  <Select defaultValue={orderModal.order.operator || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择处理人" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="op1">客服001</SelectItem>
                      <SelectItem value="op2">客服002</SelectItem>
                      <SelectItem value="op3">客服003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Processing Note */}
              <div>
                <Label>处理备注</Label>
                <Textarea 
                  placeholder="添加处理备注信息..."
                  defaultValue={orderModal.order.note}
                  className="mt-1"
                />
              </div>

              {/* Failure Info - Show only when status is failed or retry_needed */}
              {(orderModal.order.status === 'failed' || orderModal.order.status === 'retry_needed') && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <Label className="text-red-800">失败原因</Label>
                  <div className="mt-2 space-y-2">
                    <Select defaultValue="verification">
                      <SelectTrigger>
                        <SelectValue placeholder="选择失败原因" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verification">需要验证码</SelectItem>
                        <SelectItem value="wrong_password">账号密码错误</SelectItem>
                        <SelectItem value="region_limit">地区限制</SelectItem>
                        <SelectItem value="other">其他原因</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">重试次数: {orderModal.order.retry_count}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  联系用户
                </Button>
                <Button variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试充值
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderModal({ open: false, order: null })}>
              取消
            </Button>
            <Button onClick={() => {
              // Handle order update
              setOrderModal({ open: false, order: null });
            }}>
              确认更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

}

export default PlusRechargeOrders;