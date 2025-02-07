// src/hooks/useOrders.ts
import { api } from "~/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import type { 
  Order, 
  OrderType, 
  OrderStatus,
  ResourcePool,
  OrderStats,
  AccelerationOrder,
  AppleIdOrder,
  RechargeOrder
} from "../types";

// Update API response type to handle Date objects
interface ApiOrderResponse {
  id: string;
  type: OrderType;
  userId: string;
  userEmail?: string;
  user?: {
    email: string;
  };
  amount: string | number;
  status: OrderStatus;
  createTime?: string;
  createdAt?: Date | null;  // Updated to handle Date
  updateTime?: string;
  updatedAt?: Date | null;  // Updated to handle Date
  remark?: string;
  product?: {
    name: string;
    description: string;
  };
  accelerationOrder?: {
    plan: 'monthly' | 'quarterly' | 'yearly';
    configuration?: string;
  };
  appleIdOrder?: {
    email?: string;
    password?: string;
  };
  rechargeOrder?: {
    usdAmount: string | number;
    exchangeRate: string | number;
    giftCardCode?: string;
    appliedAccount: string;
  };
}

function mapApiResponseToOrder(apiOrder: unknown): Order {
  // First cast to unknown, then to our expected type
  const typedOrder = apiOrder as ApiOrderResponse;
  
  // Helper functions
  const parseAmount = (value: string | number | undefined): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value ?? 0;
  };

  const formatDate = (date: Date | string | null | undefined): string => {
    if (date instanceof Date) {
      return date.toISOString();
    }
    if (typeof date === 'string') {
      return date;
    }
    return new Date().toISOString();
  };

  const baseOrder = {
    id: typedOrder.id,
    type: typedOrder.type,
    userId: typedOrder.userId,
    userEmail: typedOrder.userEmail ?? typedOrder.user?.email ?? '',
    amount: parseAmount(typedOrder.amount),
    status: typedOrder.status,
    createTime: typedOrder.createTime ?? formatDate(typedOrder.createdAt),
    updateTime: typedOrder.updateTime ?? formatDate(typedOrder.updatedAt),
    remark: typedOrder.remark,
  };

  switch (typedOrder.type) {
    case 'acceleration':
      return {
        ...baseOrder,
        type: 'acceleration',
        plan: typedOrder.accelerationOrder?.plan ?? 'monthly',
        configuration: typedOrder.accelerationOrder?.configuration,
      } as AccelerationOrder;

    case 'appleId':
      return {
        ...baseOrder,
        type: 'appleId',
        account: typedOrder.appleIdOrder ? {
          email: typedOrder.appleIdOrder.email ?? '',
          password: typedOrder.appleIdOrder.password ?? '',
        } : undefined,
      } as AppleIdOrder;

    case 'recharge':
      return {
        ...baseOrder,
        type: 'recharge',
        usdAmount: parseAmount(typedOrder.rechargeOrder?.usdAmount),
        exchangeRate: parseAmount(typedOrder.rechargeOrder?.exchangeRate),
        giftCardCode: typedOrder.rechargeOrder?.giftCardCode,
        appliedAccount: typedOrder.rechargeOrder?.appliedAccount ?? '',
      } as RechargeOrder;

    default:
      throw new Error(`Unknown order type: ${typedOrder.type as string}`);
  }
}



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
  const orders = ordersData?.orders.map((order) => mapApiResponseToOrder(order as ApiOrderResponse)) ?? [];
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 获取订单统计
  const { data: statsData } = api.order.getOrderStats.useQuery(undefined, {
    // 5分钟刷新一次统计数据
    refetchInterval: 5 * 60 * 1000
  });

  const { data: selectedOrderDetails, isLoading: isLoadingDetails } = api.order.getDetails.useQuery(
    { orderId: selectedOrderId! },
    {
      enabled: !!selectedOrderId
    }
  );
  // // 获取资源池状态
  // const { data: poolStatus } = api.config.getResourcePoolStatus.useQuery(undefined, {
  //   // 1分钟刷新一次资源池状态
  //   refetchInterval: 60 * 1000
  // });

  // 处理充值订单
  const { mutate: processRecharge } = api.order.processRechargeOrder.useMutation({
    onSuccess: () => {
      toast.success("充值订单处理成功");
      void refetch();
    },
    onError: (error) => {
      toast.error(`处理失败: ${error.message}`);
    }
  });

  // 处理美区账号订单
  const { mutate: processAppleId } = api.order.processAppleIdOrder.useMutation({
    onSuccess: () => {
      toast.success("账号订单处理成功");
      void refetch();
    },
    onError: (error) => {
      toast.error(`处理失败: ${error.message}`);
    }
  });

  // 处理加速服务订单
  const { mutate: processAcceleration } = api.order.processAccelerationOrder.useMutation({
    onSuccess: () => {
      toast.success("加速服务订单处理成功");
      void refetch();
    },
    onError: (error) => {
      toast.error(`处理失败: ${error.message}`);
    }
  });

  // 取消订单
  const { mutate: cancelOrder } = api.order.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success("订单已取消");
      void refetch();
    },
    onError: (error) => {
      toast.error(`取消失败: ${error.message}`);
    }
  });

  // 获取订单详情
  const getOrderDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    // try {
    //   return await api.order.getDetails.useQuery({ orderId });
    // } catch (error) {
    //   toast.error('获取订单详情失败');
    //   throw error;
    // }
  };

  // 更新筛选条件
  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // 重置页码
  };

  return {
    orders,
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
    refetch,
    selectedOrderDetails: selectedOrderDetails ? mapApiResponseToOrder(selectedOrderDetails as ApiOrderResponse) : null,
    isLoadingDetails,
    setSelectedOrderId
  };
}
