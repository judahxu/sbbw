// src/app/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { ResourcePoolStatus } from './components/ResourcePoolStatus';
import { StatsOverview } from './components/StatsOverview';
import { OrderTable } from './components/OrderTable';
import { OrderToolbar } from './components/OrderToolbar';
import { RechargeModal } from './components/RechargeModal';
import { AppleIdModal } from './components/AppleIdModal';
import { AccelerationModal } from './components/AccelerationModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { Order, OrderType, OrderStatus } from './types';
import { useOrders } from './hooks/useOrders';

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
    cancelOrder,
    getOrderDetail
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showAppleIdModal, setShowAppleIdModal] = useState(false);
  const [showAccelerationModal, setShowAccelerationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 处理订单操作
  const handleProcess = (order: Order) => {
    setSelectedOrder(order);
    switch (order.type) {
      case 'recharge':
        setShowRechargeModal(true);
        break;
      case 'appleId':
        setShowAppleIdModal(true);
        break;
      case 'acceleration':
        setShowAccelerationModal(true);
        break;
    }
  };

  // 查看订单详情
  const handleViewDetails = async (order: Order) => {
    try {
      const details = await getOrderDetail(order.id);
      setSelectedOrder(details);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to get order details:', error);
    }
  };

  // 处理充值服务订单
  const handleRechargeConfirm = async (giftCardCode: string, remark: string) => {
    if (!selectedOrder) return;
    
    try {
      await processRecharge({
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
      await processAppleId({
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
    port: number;
    password: string;
    remark?: string;
  }) => {
    if (!selectedOrder) return;

    try {
      await processAcceleration({
        orderId: selectedOrder.id,
        configuration: {
          server: data.server,
          port: data.port,
          password: data.password
        },
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
        onCancel={cancelOrder}
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

      {selectedOrder?.type === 'appleId' && (
        <AppleIdModal
          open={showAppleIdModal}
          order={selectedOrder}
          onClose={() => {
            setShowAppleIdModal(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleAppleIdConfirm}
          onManualProcess={() => {
            console.log('Manual process for Apple ID:', selectedOrder.id);
            setShowAppleIdModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {selectedOrder?.type === 'acceleration' && (
        <AccelerationModal
          open={showAccelerationModal}
          order={selectedOrder}
          onClose={() => {
            setShowAccelerationModal(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleAccelerationConfirm}
          onManualProcess={() => {
            console.log('Manual process for acceleration:', selectedOrder.id);
            setShowAccelerationModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          open={showDetailModal}
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}