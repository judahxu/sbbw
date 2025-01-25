// hooks/useOrderList.ts
import { useState } from 'react';
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { mockOrderService } from '../mock/service';

interface UseOrderListProps {
  initialPageSize?: number;
}

export const useOrderList = ({ initialPageSize = 10 }: UseOrderListProps = {}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [version, setVersion] = useState('all');
  const [duration, setDuration] = useState('all');

  // 使用Mock数据
  const mockData = mockOrderService.getOrders({
    page,
    pageSize,
    search: searchQuery,
    status: orderStatus !== 'all' ? orderStatus : undefined,
    version: version !== 'all' ? version : undefined,
    duration: duration !== 'all' ? duration : undefined,
  });

  const mockStats = mockOrderService.getStats();

  // 如果启用了mock，使用mock数据
  const {
    data: ordersData,
    isLoading,
    refetch
  } = api.order.list.useQuery(
    {
      type: 'accelerator',
      status: orderStatus !== 'all' ? orderStatus : undefined,
      search: searchQuery,
      page,
      pageSize,
    },
    {
      keepPreviousData: true,
      enabled: !mockData, // 如果有mock数据就不调用API
      onError: (error) => {
        toast.error(error.message || '加载订单列表失败');
      }
    }
  );

  // 获取统计数据
  const { data: statsData } = api.order.getStats.useQuery(
    { type: 'accelerator' },
    {
      enabled: !mockStats, // 如果有mock数据就不调用API
      onError: (error) => {
        toast.error(error.message || '加载统计数据失败');
      }
    }
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 重置到第一页
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // 重置到第一页
  };

  const handleStatusChange = (status: string) => {
    setOrderStatus(status);
    setPage(1);
  };

  const handleVersionChange = (newVersion: string) => {
    setVersion(newVersion);
    setPage(1);
  };

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    setPage(1);
  };

  const refresh = () => {
    if (!mockData) {
      void refetch();
    }
  };

  return {
    // 数据 - 优先使用mock数据
    orders: mockData?.data.items || ordersData?.items || [],
    total: mockData?.data.total || ordersData?.total || 0,
    stats: mockStats?.data || statsData || null,
    isLoading: !mockData && isLoading,

    // 分页参数
    page,
    pageSize,
    
    // 过滤参数
    searchQuery,
    orderStatus,
    version,
    duration,

    // 处理函数
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleStatusChange,
    handleVersionChange,
    handleDurationChange,
    refresh,
  };
};