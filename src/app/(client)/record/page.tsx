'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { OrderDetailDialog } from './OrderDetailDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


type OrderType = 'acceleration' | 'appleId' | 'recharge';
type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

interface BaseOrder {
  id: string;
  type: OrderType;
  status: OrderStatus;
  amount: number;
  createdAt: string;
  processedAt?: string;
}

interface AccelerationOrder extends BaseOrder {
  type: 'acceleration';
  accelerationOrder?: {
    plan: 'monthly' | 'quarterly' | 'yearly';
  };
}

interface AppleIdOrder extends BaseOrder {
  type: 'appleId';
  appleIdOrder?: {
    email: string;
  };
}

interface RechargeOrder extends BaseOrder {
  type: 'recharge';
  rechargeOrder?: {
    usdAmount: number;
  };
}

type Order = AccelerationOrder | AppleIdOrder | RechargeOrder;


interface OrderResponse {
  id: string;
  type: OrderType;
  status: OrderStatus;
  amount: number;
  createdAt: Date | null;
  processedAt?: Date | null;
  accelerationOrder?: {
    plan: 'monthly' | 'quarterly' | 'yearly' | null;
  } | null;
  appleIdOrder?: {
    email: string | null;
  } | null;
  rechargeOrder?: {
    usdAmount: string;
  } | null;
}


 const STATUS_MAP = {
  'pending_payment': { label: '待支付', className: 'bg-yellow-100 text-yellow-800' },
  'paid': { label: '已支付', className: 'bg-blue-100 text-blue-800' },
  'processing': { label: '处理中', className: 'bg-blue-100 text-blue-800' },
  'completed': { label: '已完成', className: 'bg-green-100 text-green-800' },
  'failed': { label: '失败', className: 'bg-red-100 text-red-800' },
  'cancelled': { label: '已取消', className: 'bg-gray-100 text-gray-800' },
  'refunded': { label: '已退款', className: 'bg-gray-100 text-gray-800' }
};

 type StatusKey = keyof typeof STATUS_MAP;

 const getStatusBadge = (status: string) => {
  const statusInfo = STATUS_MAP[status as StatusKey] || { 
    label: status, 
    className: 'bg-gray-100 text-gray-800' 
  };
  
  return (
    <Badge className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  );
};

const OrdersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const pageSize = 10;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const utils = api.useUtils();

  // 获取订单列表
  const { data: ordersData, isLoading } = api.order.getUserOrders.useQuery({
    page,
    pageSize,
    type: selectedType !== 'all' ? (selectedType as 'recharge' | 'appleId' | 'acceleration') : undefined,
    // search: searchQuery || undefined,
  }, {
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  // 获取订单详情
  const { data: selectedOrder, isLoading: isLoadingDetails } = api.order.getDetails.useQuery(
    { orderId: selectedOrderId! },
    {
      enabled: !!selectedOrderId
    }
  );


  const { mutate: cancelOrder , isPending:isCancelling } = api.order.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success('订单已取消');
      // 刷新订单列表
      void utils.order.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error(`取消失败: ${error.message}`);
    }
  });

  const handleCancelOrder = (orderId: string) => {
    setShowCancelDialog(true);
    setCancellingOrderId(orderId);
  };
  
  // 确认取消订单
  const confirmCancelOrder = () => {
    if (!cancellingOrderId) return;
    
    cancelOrder({ 
      orderId: cancellingOrderId, 
      reason: 'cancelled'
    });
    setShowCancelDialog(false);
    setCancellingOrderId(null);
  };
  



  const getProductInfo = (order: OrderResponse) => {
    switch (order.type) {
      case 'appleId':
        return {
          name: '美区账号',
          description: order.appleIdOrder ? `账号：${order.appleIdOrder.email}` : '等待分配'
        };
      case 'acceleration':
        const plan = order.accelerationOrder?.plan;
        return {
          name: '加速服务',
          description: `${
            plan === 'monthly' ? '月付' :
            plan === 'quarterly' ? '季付' : '年付'
          }套餐`
        };
      case 'recharge':
        return {
          name: '充值服务',
          description: order.rechargeOrder ? 
            `$${order.rechargeOrder.usdAmount}(¥${order.amount})` : 
            '处理中'
        };
      default:
        return { name: '未知服务', description: '' };
    }
  };

  // const getStatusBadge = (status: string) => {
  //   const statusInfo = STATUS_MAP[status as StatusKey] || { 
  //     label: status, 
  //     className: 'bg-gray-100 text-gray-800' 
  //   };
    
  //   return (
  //     <Badge className={statusInfo.className}>
  //       {statusInfo.label}
  //     </Badge>
  //   );
  // };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <p className="text-gray-500 mt-1">查看和管理您的所有订单</p>
      </div>

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* <div className="flex items-center space-x-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索订单号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div> */}

        <Select value={selectedType} onValueChange={setSelectedType}>
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
      </div>

      {/* 订单列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : ordersData?.orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无订单数据
        </div>
      ) : (
        <div className="space-y-4">
          {ordersData?.orders.map((order) => {
            const productInfo = getProductInfo(order);
            
            return (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">订单号: {order.id}</p>
                      <CardTitle className="mt-1">{productInfo.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">￥{order.amount}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{productInfo.description}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t text-sm text-gray-500">
                    <div className="space-x-4">
                    <span>创建时间: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '无'}</span>
                    {order.processedAt && (
                        <span>处理时间: {new Date(order.processedAt).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'pending_payment' ? (
                        <>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => router.push(`/buy?id=${order.id}`)}
                          >
                            去支付
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? '取消中...' : '取消订单'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => window.open(order.type == 'appleId'?'/docs/appstore-guide':order.type == 'recharge'?'/docs/recharge-guide':'/docs/vpn-guide', '_blank')}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            技术支持
                          </Button>
                          {order.status !== 'cancelled' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              订单详情
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            );
          })}

          {/* 分页 */}
          {ordersData && ordersData.total > pageSize && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      aria-disabled={page === 1}
                    ></PaginationPrevious>
                  </PaginationItem>
                  
                  {Array.from({ length: Math.ceil(ordersData.total / pageSize) }).map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => p + 1)}
                      aria-disabled={page >= Math.ceil(ordersData.total / pageSize)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* 订单详情弹窗 */}
      {selectedOrder &&<OrderDetailDialog
        open={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        order={selectedOrder}
        isLoading={isLoadingDetails}
      />}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认取消订单？</AlertDialogTitle>
            <AlertDialogDescription>
              取消订单后，如果您仍需要服务，需要重新下单。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowCancelDialog(false);
                setCancellingOrderId(null);
              }}
            >
              不取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className="bg-red-600 hover:bg-red-700"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  取消中...
                </>
              ) : (
                '确认取消'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;