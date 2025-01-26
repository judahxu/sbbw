// src/hooks/useOrders.ts
import { api } from "~/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import type { 
  Order, 
  OrderType, 
  OrderStatus,
  ResourcePool,
  OrderStats 
} from "../types";

interface OrderFilters {
  type?: OrderType | 'all';
  status?: OrderStatus | 'all';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useOrders() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<OrderFilters>({});
  
  // 获取订单列表
  const {
    data: ordersData,
    isLoading,
    refetch
  } = api.order.getOrders.useQuery({
    page,
    pageSize,
    ...(filters.type && filters.type !== 'all' ? { type: filters.type } : {}),
    ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {})
  });

  // 获取订单统计
  const { data: statsData } = api.order.getOrderStats.useQuery(undefined, {
    // 5分钟刷新一次统计数据
    refetchInterval: 5 * 60 * 1000
  });

  // // 获取资源池状态
  // const { data: poolStatus } = api.config.getResourcePoolStatus.useQuery(undefined, {
  //   // 1分钟刷新一次资源池状态
  //   refetchInterval: 60 * 1000
  // });

  // 处理充值订单
  const { mutate: processRecharge } = api.order.processRechargeOrder.useMutation({
    onSuccess: () => {
      toast.success("充值订单处理成功");
      refetch();
    },
    onError: (error) => {
      toast.error(`处理失败: ${error.message}`);
    }
  });

  // 处理美区账号订单
  const { mutate: processAppleId } = api.order.processAppleIdOrder.useMutation({
    onSuccess: () => {
      toast.success("账号订单处理成功");
      refetch();
    },
    onError: (error) => {
      toast.error(`处理失败: ${error.message}`);
    }
  });

  // 处理加速服务订单
  const { mutate: processAcceleration } = api.order.processAccelerationOrder.useMutation({
    onSuccess: () => {
      toast.success("加速服务订单处理成功");
      refetch();
    },
    onError: (error) => {
      toast.error(`处理失败: ${error.message}`);
    }
  });

  // 取消订单
  const { mutate: cancelOrder } = api.order.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success("订单已取消");
      refetch();
    },
    onError: (error) => {
      toast.error(`取消失败: ${error.message}`);
    }
  });

  // 获取订单详情
  const getOrderDetail = async (orderId: string) => {
    try {
      return await api.order.getOrderDetail.query({ orderId });
    } catch (error) {
      toast.error('获取订单详情失败');
      throw error;
    }
  };

  // 更新筛选条件
  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // 重置页码
  };

  return {
    orders: ordersData?.orders ?? [],
    total: ordersData?.total ?? 0,
    page,
    pageSize,
    isLoading,
    stats: statsData,
    // pools: poolStatus?.pools ?? [],
    filters,
    setPage,
    setPageSize,
    updateFilters,
    processRecharge,
    processAppleId,
    processAcceleration,
    cancelOrder,
    getOrderDetail,
    refetch
  };
}
