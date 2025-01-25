// hooks/useAPIOrders.ts
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useDialog } from './useDialog';
import { mockOrders, mockStats, mockOrderHistory } from '../mocks/apiOrderData';

export function useAPIOrders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 对话框状态管理
  const detailDialog = useDialog();
  const resetKeyDialog = useDialog();
  const rechargeDialog = useDialog();
  const renewalDialog = useDialog();

  const { data: ordersData, isLoading } = useMockQuery('orders', () => ({
    items: mockOrders,
    total: mockOrders.length,
    page: 1,
    pageSize: 10
  }));
  
  const { data: statsData } = useMockQuery('stats', () => mockStats);
  
  const { data: orderHistory } = useMockQuery(
    ['orderHistory', selectedOrder?.id],
    () => mockOrderHistory,
    {
      enabled: !!selectedOrder
    }
  );
  
  // 模拟查询hook
  function useMockQuery(key: string | string[], queryFn: () => any, options = {}) {
    const [data] = useState(() => queryFn());
    
    return {
      data,
      isLoading: false,
      error: null,
      refetch: () => {}
    };
  }

  // API 查询
  // const { data: ordersData, isLoading } = api.order.list.useQuery(
  //   {
  //     type: 'api',
  //     status: orderStatus !== 'all' ? orderStatus : undefined,
  //     search: searchQuery,
  //     page,
  //     pageSize,
  //   }
  // );

  // const { data: statsData } = api.order.getStats.useQuery({
  //   type: 'api'
  // });

  
  // Mutations
  const resetKeyMutation = api.order.resetApiKey.useMutation({
    onSuccess: () => {
      toast.success('API Key重置成功');
      resetKeyDialog.close();
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || '重置失败');
    }
  });

  const rechargeMutation = api.order.rechargeApiKey.useMutation({
    onSuccess: () => {
      toast.success('充值成功');
      rechargeDialog.close();
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || '充值失败');
    }
  });

  const renewalMutation = api.order.renewalApiKey.useMutation({
    onSuccess: () => {
      toast.success('续期成功');
      renewalDialog.close();
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || '续期失败');
    }
  });

  const updateStatusMutation = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('状态更新成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || '更新失败');
    }
  });

  // 处理函数
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setOrderStatus(value);
    setPage(1);
  };

  const handleResetKey = async (orderId: string, reason: string) => {
    await resetKeyMutation.mutateAsync({
      orderId,
      reason,
      newApiKey: generateApiKey()
    });
  };

  const handleRecharge = async (orderId: string, amount: string) => {
    await rechargeMutation.mutateAsync({
      orderId,
      amount
    });
  };

  const handleRenewal = async (orderId: string, duration: string) => {
    await renewalMutation.mutateAsync({
      orderId,
      duration
    });
  };

  const handleUpdateStatus = async (orderId: string, status: string, note?: string) => {
    await updateStatusMutation.mutateAsync({
      orderId,
      status,
      note
    });
  };

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
    void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
  };


  // 处理函数
  const handleShowDetail = (order) => {
    setSelectedOrder(order);
    detailDialog.open();
  };

  const handleShowResetKey = (order) => {
    setSelectedOrder(order);
    resetKeyDialog.open();
  };

  const handleShowRecharge = (order) => {
    setSelectedOrder(order);
    rechargeDialog.open();
  };

  const handleShowRenewal = (order) => {
    setSelectedOrder(order);
    renewalDialog.open();
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    detailDialog.close();
    resetKeyDialog.close();
    rechargeDialog.close();
    renewalDialog.close();
  };

  return {
    // 数据
    orders: ordersData?.items || [],
    stats: statsData,
    filters: {
      search: searchQuery,
      status: orderStatus
    },
    isLoading,
    selectedOrder,
    
    // 对话框状态
    dialogs: {
      detail: {
        isOpen: detailDialog.isOpen,
        show: handleShowDetail,
        close: handleCloseDialog
      },
      resetKey: {
        isOpen: resetKeyDialog.isOpen,
        show: handleShowResetKey,
        close: handleCloseDialog
      },
      recharge: {
        isOpen: rechargeDialog.isOpen,
        show: handleShowRecharge,
        close: handleCloseDialog
      },
      renewal: {
        isOpen: renewalDialog.isOpen,
        show: handleShowRenewal,
        close: handleCloseDialog
      }
    },

    // 处理函数
    handleSearch,
    handleStatusChange,
    handleResetKey,
    handleRecharge,
    handleRenewal,
    handleUpdateStatus,
    refresh
  };
}