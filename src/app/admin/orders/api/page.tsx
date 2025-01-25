'use client'
import React, { useState } from 'react';
import { APIOrderTable } from './components/APIOrderTable';
import { APIOrderStats } from './components/APIOrderStats';
import { APIOrderFilters } from './components/APIOrderFilters';
import { 
  APIOrderDetailDialog,
  ResetKeyDialog, 
  RechargeDialog,
  RenewalDialog
} from './components/dialogs';
import { useAPIOrders } from './hooks/useAPIOrders';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APIOrderManagement() {
  const {
    orders,
    stats,
    filters,
    isLoading,
    selectedOrder,
    dialogs,
    handleSearch,
    handleStatusChange,
    handleResetKey,
    handleRecharge,
    handleRenewal,
    handleUpdateStatus,
    refresh
  } = useAPIOrders();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">API订单管理</h1>
          <p className="text-gray-500">管理和处理API订单</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      <APIOrderStats stats={stats} />
      
      <APIOrderFilters 
        filters={filters}
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
      />

      <APIOrderTable 
        orders={orders}
        isLoading={isLoading}
        onShowDetail={dialogs.detail.show}
        onResetKey={dialogs.resetKey.show}
        onRecharge={dialogs.recharge.show}
        onRenewal={dialogs.renewal.show}
      />

      <APIOrderDetailDialog
        open={dialogs.detail.isOpen}
        order={selectedOrder}
        onClose={dialogs.detail.close}
        onUpdateStatus={handleUpdateStatus}
      />

      <ResetKeyDialog
        open={dialogs.resetKey.isOpen}
        order={selectedOrder}
        onClose={dialogs.resetKey.close}
        onConfirm={handleResetKey}
      />

      <RechargeDialog
        open={dialogs.recharge.isOpen}
        order={selectedOrder}
        onClose={dialogs.recharge.close}
        onConfirm={handleRecharge}
      />

      <RenewalDialog
        open={dialogs.renewal.isOpen}
        order={selectedOrder} 
        onClose={dialogs.renewal.close}
        onConfirm={handleRenewal}
      />
    </div>
  );
}