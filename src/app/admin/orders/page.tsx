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

export default function OrdersPage() {
  // 状态管理
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
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // 取消订单
  const handleCancel = async (order: Order) => {
    try {
      // 实现取消订单的逻辑
      console.log('Cancelling order:', order.id);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  // 处理充值服务订单
  const handleRechargeConfirm = async (giftCardCode: string, remark: string) => {
    try {
      // 实现充值服务处理逻辑
      console.log('Processing recharge order:', {
        orderId: selectedOrder?.id,
        giftCardCode,
        remark
      });
    } catch (error) {
      console.error('Failed to process recharge order:', error);
      throw error;
    }
  };

  // 处理美区账号订单
  const handleAppleIdConfirm = async (data: { 
    email: string; 
    password: string; 
    remark?: string 
  }) => {
    try {
      // 实现美区账号分配逻辑
      console.log('Processing Apple ID order:', {
        orderId: selectedOrder?.id,
        ...data
      });
    } catch (error) {
      console.error('Failed to process Apple ID order:', error);
      throw error;
    }
  };

  // 处理加速服务订单
  const handleAccelerationConfirm = async (data: {
    server: string;
    port: number;
    password: string;
    remark?: string;
  }) => {
    try {
      // 实现加速服务配置逻辑
      console.log('Processing acceleration order:', {
        orderId: selectedOrder?.id,
        ...data
      });
    } catch (error) {
      console.error('Failed to process acceleration order:', error);
      throw error;
    }
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    console.log('Searching:', query);
  };

  // 处理类型筛选
  const handleTypeChange = (type: OrderType | 'all') => {
    console.log('Filtering by type:', type);
  };

  // 处理状态筛选
  const handleStatusChange = (status: OrderStatus | 'all') => {
    console.log('Filtering by status:', status);
  };

  // 处理数据导出
  const handleExport = () => {
    console.log('Exporting data');
  };

  // 示例数据
  const mockStats = {
    today: 24,
    pending: 7,
    monthlyIncome: 15789,
    completionRate: 98
  };

  const mockPools = [
    {
      type: 'accelerator' as const,
      available: 128,
      total: 150,
      warning: false
    },
    {
      type: 'appleId' as const,
      available: 45,
      total: 50,
      warning: true
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <StatsOverview stats={mockStats} />
      
      <ResourcePoolStatus 
        pools={mockPools}
        onAddResource={(type) => console.log('Adding resource:', type)}
        onViewResources={(type) => console.log('Viewing resources:', type)}
      />
      
      <OrderToolbar
        onSearch={handleSearch}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onExport={handleExport}
        onAdvancedFilter={() => console.log('Advanced filter')}
      />
      
      <OrderTable
        orders={[]} // 这里需要实际的订单数据
        onProcess={handleProcess}
        onViewDetails={handleViewDetails}
        onCancel={handleCancel}
      />

      {/* 处理弹窗 */}
      {selectedOrder?.type === 'recharge' && (
        <RechargeModal
          open={showRechargeModal}
          order={selectedOrder}
          onClose={() => setShowRechargeModal(false)}
          onConfirm={handleRechargeConfirm}
        />
      )}

      {selectedOrder?.type === 'appleId' && (
        <AppleIdModal
          open={showAppleIdModal}
          order={selectedOrder}
          onClose={() => setShowAppleIdModal(false)}
          onConfirm={handleAppleIdConfirm}
          onManualProcess={() => {
            console.log('Manual process for Apple ID:', selectedOrder.id);
            // 实现转人工处理逻辑
          }}
        />
      )}

      {selectedOrder?.type === 'acceleration' && (
        <AccelerationModal
          open={showAccelerationModal}
          order={selectedOrder}
          onClose={() => setShowAccelerationModal(false)}
          onConfirm={handleAccelerationConfirm}
          onManualProcess={() => {
            console.log('Manual process for acceleration:', selectedOrder.id);
            // 实现转人工处理逻辑
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

// API 调用函数
async function fetchOrders(params?: {
  search?: string;
  type?: OrderType | 'all';
  status?: OrderStatus | 'all';
  page?: number;
  pageSize?: number;
}) {
  // 实现获取订单列表的API调用
  return fetch('/api/admin/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(res => res.json());
}

async function processOrder(orderId: string, data: any) {
  // 实现处理订单的API调用
  return fetch(`/api/admin/orders/${orderId}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

async function cancelOrder(orderId: string) {
  // 实现取消订单的API调用
  return fetch(`/api/admin/orders/${orderId}/cancel`, {
    method: 'POST',
  }).then(res => res.json());
}

async function exportOrders(params?: any) {
  // 实现导出订单的API调用
  return fetch('/api/admin/orders/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(res => res.blob());
}

// 工具函数
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}