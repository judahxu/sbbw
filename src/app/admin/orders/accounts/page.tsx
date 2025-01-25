'use client'
import React, { useState, useCallback, useMemo } from 'react';
import { OrderStats } from './OrderStats';
import { OrderFilters } from './OrderFilters';
import { OrderTable } from './OrderTable';
import { OrderProcessDialog } from './OrderProcessDialog';
import { OrderDetailDialog } from './OrderDetailDialog';
import { AccountAllocationDialog } from './AccountAllocationDialog';
import { OrderFilters as OrderFiltersType, Order } from './types';
import { api } from '~/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';

export const OrderManagement = () => {
  // 查询过滤条件状态
  const [filters, setFilters] = useState<OrderFiltersType>({
    search: '',
    status: 'all',
    dateRange: 'today',
    page: 1,
    pageSize: 10
  });

  // 对话框状态
  const [activeDialog, setActiveDialog] = useState<{
    type: 'process' | 'detail' | 'allocate' | null;
    orderId: string | null;
  }>({
    type: null,
    orderId: null
  });

  // 获取查询客户端
  const queryClient = useQueryClient();

  // 添加这段模拟数据
const mockOrders: Order[] = [
  {
    id: "ord_001",
    orderNumber: "ORD20240124001",
    customer: "张三",
    customerEmail: "zhangsan@example.com",
    amountUsd: 20,
    amountCny: 138,
    paymentMethod: "alipay",
    paymentStatus: "paid",
    orderStatus: "pending",
    allocationStatus: "pending",
    createdAt: "2024-01-24 10:30:00",
    updatedAt: "2024-01-24 10:30:00",
    paymentTime: "2024-01-24 10:31:00",
    accountInfo: {
      email: "",
      platform: "chatgpt",
      type: "permanent",
      bundleType: "账号+90天加速器"
    },
    serviceConfig: {
      acceleratorDays: 90
    }
  },
  {
    id: "ord_002",
    orderNumber: "ORD20240124002",
    customer: "李四",
    customerEmail: "lisi@example.com",
    amountUsd: 60,
    amountCny: 399,
    paymentMethod: "wechat",
    paymentStatus: "paid",
    orderStatus: "processing",
    allocationStatus: "completed",
    createdAt: "2024-01-24 11:15:00",
    updatedAt: "2024-01-24 11:20:00",
    paymentTime: "2024-01-24 11:16:00",
    accountInfo: {
      email: "gpt123@example.com",
      platform: "chatgpt",
      type: "permanent",
      bundleType: "Plus账号3个月"
    },
    serviceConfig: {
      plusMonths: 3,
      acceleratorDays: 90
    },
    processingInfo: {
      operatorId: "op_001",
      operatorName: "客服小王",
      note: "正在处理Plus订阅",
      retryCount: 0,
      lastProcessTime: "2024-01-24 11:20:00"
    }
  },
  {
    id: "ord_003",
    orderNumber: "ORD20240124003",
    customer: "王五",
    customerEmail: "wangwu@example.com",
    amountUsd: 14.99,
    amountCny: 99,
    paymentMethod: "alipay",
    paymentStatus: "paid",
    orderStatus: "completed",
    allocationStatus: "completed",
    createdAt: "2024-01-24 09:00:00",
    updatedAt: "2024-01-24 09:15:00",
    paymentTime: "2024-01-24 09:01:00",
    accountInfo: {
      email: "gpt456@example.com",
      platform: "chatgpt",
      type: "temporary",
      bundleType: "临时账号30天"
    },
    serviceConfig: {
      temporaryDays: 30,
      acceleratorDays: 30
    },
    processingInfo: {
      operatorId: "op_002",
      operatorName: "客服小李",
      note: "账号已分配",
      retryCount: 0,
      lastProcessTime: "2024-01-24 09:15:00"
    }
  },
  {
    id: "ord_004",
    orderNumber: "ORD20240124004",
    customer: "赵六",
    customerEmail: "zhaoliu@example.com",
    amountUsd: 115,
    amountCny: 799,
    paymentMethod: "wechat",
    paymentStatus: "pending_payment",
    orderStatus: "pending",
    allocationStatus: "pending",
    createdAt: "2024-01-24 14:00:00",
    updatedAt: "2024-01-24 14:00:00",
    accountInfo: {
      email: "",
      platform: "claude",
      type: "permanent",
      bundleType: "Plus账号6个月"
    },
    serviceConfig: {
      plusMonths: 6,
      acceleratorDays: 180
    }
  },
  {
    id: "ord_005",
    orderNumber: "ORD20240124005",
    customer: "钱七",
    customerEmail: "qianqi@example.com",
    amountUsd: 20,
    amountCny: 138,
    paymentMethod: "alipay",
    paymentStatus: "paid",
    orderStatus: "failed",
    allocationStatus: "failed",
    createdAt: "2024-01-24 13:00:00",
    updatedAt: "2024-01-24 13:30:00",
    paymentTime: "2024-01-24 13:01:00",
    accountInfo: {
      email: "",
      platform: "chatgpt",
      type: "permanent",
      bundleType: "Plus账号1个月"
    },
    serviceConfig: {
      plusMonths: 1
    },
    processingInfo: {
      operatorId: "op_001",
      operatorName: "客服小王",
      note: "账号验证失败，需要重新处理",
      retryCount: 2,
      lastProcessTime: "2024-01-24 13:30:00"
    }
  }
];

const { data: ordersData, isLoading: isLoadingOrders } = {
  data: {
    items: mockOrders,
    total: mockOrders.length,
    page: filters.page,
    pageSize: filters.pageSize,
  },
  isLoading: false
};

// 模拟统计数据
const { data: statsData, isLoading: isLoadingStats } = {
  data: {
    total: mockOrders.length,
    totalAmountUsd: mockOrders.reduce((sum, order) => sum + order.amountUsd, 0),
    totalAmountCny: mockOrders.reduce((sum, order) => sum + order.amountCny, 0),
    pending: mockOrders.filter(order => order.orderStatus === 'pending').length,
    processing: mockOrders.filter(order => order.orderStatus === 'processing').length,
    completed: mockOrders.filter(order => order.orderStatus === 'completed').length,
    failed: mockOrders.filter(order => order.orderStatus === 'failed').length,
    pendingPayment: mockOrders.filter(order => order.paymentStatus === 'pending_payment').length
  },
  isLoading: false
};

  // API 查询
  // const { data: ordersData, isLoading: isLoadingOrders } = api.order.list.useQuery(
  //   {
  //     search: filters.search,
  //     status: filters.status !== 'all' ? filters.status : undefined,
  //     page: filters.page,
  //     pageSize: filters.pageSize,
  //   },
  //   {
  //     keepPreviousData: true
  //   }
  // );

  // 获取统计数据
  // const { data: statsData, isLoading: isLoadingStats } = api.order.getStats.useQuery();

  // 获取订单历史
  const { data: orderHistory } = api.order.getHistory.useQuery(
    { orderId: activeDialog.orderId || '' },
    { enabled: !!activeDialog.orderId }
  );

  // Mutations
  const processOrderMutation = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('订单处理成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
      void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
      setActiveDialog({ type: null, orderId: null });
    },
    onError: (error) => {
      toast.error(error.message || '处理失败');
    }
  });

  const allocateAccountMutation = api.order.allocateAccount.useMutation({
    onSuccess: () => {
      toast.success('账号分配成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
      void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
      setActiveDialog({ type: null, orderId: null });
    },
    onError: (error) => {
      toast.error(error.message || '分配失败');
    }
  });

  // 处理过滤器变更
  const handleFilterChange = useCallback((newFilters: Partial<OrderFiltersType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // 重置页码
      page: newFilters.search !== undefined || 
            newFilters.status !== undefined || 
            newFilters.dateRange !== undefined 
        ? 1 
        : prev.page
    }));
  }, []);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
    void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
  }, [queryClient]);

  // 处理导出
  const handleExport = useCallback(() => {
    // 实现导出逻辑
    toast.info('导出功能开发中');
  }, []);

  // 处理分页
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // 处理查看详情
  const handleViewDetails = useCallback((order: Order) => {
    setActiveDialog({
      type: 'detail',
      orderId: order.id
    });
  }, []);

  // 处理订单处理
  const handleProcess = useCallback((order: Order) => {
    setActiveDialog({
      type: 'process',
      orderId: order.id
    });
  }, []);

  // 处理账号分配
  const handleAllocate = useCallback((order: Order) => {
    setActiveDialog({
      type: 'allocate',
      orderId: order.id
    });
  }, []);

  // 当前选中的订单
  const selectedOrder = useMemo(() => {
    if (!activeDialog.orderId || !ordersData?.items) return null;
    return ordersData.items.find(order => order.id === activeDialog.orderId) || null;
  }, [activeDialog.orderId, ordersData?.items]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">订单管理</h1>
          <p className="text-gray-500">管理和处理账号订单</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <OrderStats
        stats={statsData || {
          total: 0,
          totalAmountUsd: 0,
          totalAmountCny: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          pendingPayment: 0
        }}
        isLoading={isLoadingStats}
      />

      {/* 过滤器 */}
      <OrderFilters
        filters={filters}
        isLoading={isLoadingOrders}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* 订单列表 */}
      <OrderTable
        orders={ordersData?.items || []}
        isLoading={isLoadingOrders}
        onViewDetails={handleViewDetails}
        onProcess={handleProcess}
        onAllocate={handleAllocate}
      />

      {/* 分页 */}
      {ordersData && ordersData.items.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 mt-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">
            共 {ordersData.total} 条数据
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
            >
              上一页
            </Button>
            <div className="text-sm">
              第 {filters.page} 页，
              共 {Math.ceil(ordersData.total / filters.pageSize)} 页
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={
                filters.page >= 
                Math.ceil(ordersData.total / filters.pageSize)
              }
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 处理订单对话框 */}
      <OrderProcessDialog
        order={selectedOrder}
        open={activeDialog.type === 'process'}
        onClose={() => setActiveDialog({ type: null, orderId: null })}
        onSubmit={async (data) => {
          if (!selectedOrder) return;
          await processOrderMutation.mutateAsync({
            id: selectedOrder.id,
            ...data
          });
        }}
      />

      {/* 订单详情对话框 */}
      <OrderDetailDialog
        order={selectedOrder}
        history={orderHistory}
        open={activeDialog.type === 'detail'}
        onClose={() => setActiveDialog({ type: null, orderId: null })}
      />

      {/* 分配账号对话框 */}
      <AccountAllocationDialog
        order={selectedOrder}
        open={activeDialog.type === 'allocate'}
        onClose={() => setActiveDialog({ type: null, orderId: null })}
        onSubmit={async (data) => {
          if (!selectedOrder) return;
          await allocateAccountMutation.mutateAsync({
            orderId: selectedOrder.id,
            ...data
          });
        }}
      />
    </div>
  );
};

export default OrderManagement;