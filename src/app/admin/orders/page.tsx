// src/app/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { StatsOverview } from './components/StatsOverview';
import { OrderTable } from './components/OrderTable';
import { OrderToolbar } from './components/OrderToolbar';
import { RechargeModal } from './components/RechargeModal';
import { AppleIdModal } from './components/AppleIdModal';
import { AccelerationModal } from './components/AccelerationModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { Order, OrderType, OrderStatus } from './types';
import { useOrders } from './hooks/useOrders';
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';

export default function OrdersPage() {
  const {
    orders,
    total,
    page,
    pageSize,
    isLoading,
    stats,
    // pools,
    filters,
    setPage,
    setPageSize,
    updateFilters,
    processRecharge,
    processAppleId,
    processAcceleration,
    // cancelOrder,
    getOrderDetail,
    selectedOrderDetails,
    isLoadingDetails,
    setSelectedOrderId
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showAppleIdModal, setShowAppleIdModal] = useState(false);
  const [showAccelerationModal, setShowAccelerationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 处理订单操作
  const handleProcess = (order: Order) => {
    setSelectedOrder(order);
    switch (order.type) {
      case 'recharge':
        setShowRechargeModal(true);
        break;
      case 'appleId':
      case 'acceleration':
        setShowConfirmDialog(true);
        break;
    }
  };

   // 自动处理订单
   const handleAutoProcess = async () => {
    if (!selectedOrder) return;

    try {
      if (selectedOrder.type === 'appleId') {
        processAppleId({
          orderId: selectedOrder.id,
          email: '', // Will be auto-assigned
          password: '', // Will be auto-assigned
          remark: '系统自动分配'
        });
      } else if (selectedOrder.type === 'acceleration') {
        processAcceleration({
          orderId: selectedOrder.id,
          configuration: '', // Will be auto-assigned
          remark: '系统自动分配'
        });
      }
      setShowConfirmDialog(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to process order:', error);
      toast.error('处理订单失败');
    }
  };

  // 查看订单详情
  const handleViewDetails = async (order: Order) => {
    try {
      // const details = await getOrderDetail(order.id);
       setSelectedOrderId(order.id);
      // setSelectedOrder(details);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to get order details:', error);
    }
  };

  // 处理充值服务订单
  const handleRechargeConfirm = async (giftCardCode: string, remark: string) => {
    if (!selectedOrder) return;
    
    try {
      processRecharge({
        orderId: selectedOrder.id,
        giftCardCode,
        remark
      });
      setShowRechargeModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to process recharge order:', error);
    }
  };

  // 处理美区账号订单
  const handleAppleIdConfirm = async (data: { 
    email: string; 
    password: string; 
    remark?: string 
  }) => {
    if (!selectedOrder) return;

    try {
      processAppleId({
        orderId: selectedOrder.id,
        ...data
      });
      setShowAppleIdModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to process Apple ID order:', error);
    }
  };

  // 处理加速服务订单
  const handleAccelerationConfirm = async (data: {
    server: string;
    remark?: string;
  }) => {
    if (!selectedOrder) return;

    try {
      processAcceleration({
        orderId: selectedOrder.id,
        configuration: data.server,
        remark: data.remark
      });
      setShowAccelerationModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to process acceleration order:', error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <StatsOverview stats={stats ?? {
        today: 0,
        pending: 0,
        monthlyIncome: 0,
        // completionRate: 0
      }} />
      
      {/* <ResourcePoolStatus 
        pools={pools}
        onAddResource={(type) => console.log('Adding resource:', type)}
        onViewResources={(type) => console.log('Viewing resources:', type)}
      /> */}
      
      <OrderToolbar
        onSearch={(query) => updateFilters({ search: query })}
        onTypeChange={(type) => updateFilters({ type })}
        onStatusChange={(status) => updateFilters({ status })}
        onExport={() => console.log('Exporting...')}
        onAdvancedFilter={() => console.log('Advanced filter')}
      />
      
      <OrderTable
        orders={orders}
        onProcess={handleProcess}
        onViewDetails={handleViewDetails}
        // onCancel={cancelOrder}
        currentPage={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />

      {selectedOrder?.type === 'recharge' && (
        <RechargeModal
          open={showRechargeModal}
          order={selectedOrder}
          onClose={() => {
            setShowRechargeModal(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleRechargeConfirm}
        />
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>
            确认{selectedOrder?.type === 'appleId' ? '分配账号' : '开通服务'}？
          </AlertDialogTitle>
          <AlertDialogDescription>
            {selectedOrder?.type === 'appleId' 
              ? '系统将从账号池中自动分配一个可用的美区账号。请确认账号池资源充足。'
              : '系统将自动分配加速服务配置。请确认服务器资源充足。'
            }
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              setSelectedOrder(null);
            }}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAutoProcess}>
              确认处理
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {selectedOrderDetails?.id && (
        <OrderDetailModal
          open={showDetailModal}
          order={selectedOrderDetails}
          isLoading={isLoadingDetails}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}