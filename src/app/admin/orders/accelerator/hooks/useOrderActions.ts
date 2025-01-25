// hooks/useOrderActions.ts
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from "~/trpc/react";
import { toast } from "sonner";


export const useOrderActions = () => {
  const queryClient = useQueryClient();
  
  // 续期订单
  const renewMutation = api.order.renewAcceleratorOrder.useMutation({
    onSuccess: () => {
      toast.success('续期成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
      void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
    },
    onError: (error) => {
      toast.error(error.message || '续期失败');
    }
  });

  // 更新订单状态
  const updateStatusMutation = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('状态更新成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'list']] });
      void queryClient.invalidateQueries({ queryKey: [['order', 'getStats']] });
    },
    onError: (error) => {
      toast.error(error.message || '状态更新失败');
    }
  });

  const handleRenew = async (orderId: string, duration: string) => {
    try {
      await renewMutation.mutateAsync({
        orderId,
        duration,
        metadata: {
          renewedAt: new Date().toISOString(),
        }
      });
      return true;
    } catch (error) {
      console.error('续期失败:', error);
      return false;
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string, note?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status,
        note,
        metadata: {
          updatedAt: new Date().toISOString(),
        }
      });
      return true;
    } catch (error) {
      console.error('状态更新失败:', error);
      return false;
    }
  };

  return {
    handleRenew,
    handleUpdateStatus,
    isRenewing: renewMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};