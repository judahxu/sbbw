'use client';

import React, { useState } from 'react';
import OrderStats from './components/OrderStats';
import OrderFilters from './components/OrderFilters';
import OrderTable from './components/OrderTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrderList } from './hooks/useOrderList';
import { useOrderActions } from './hooks/useOrderActions';
import { AcceleratorOrder } from './utils';
import {DeviceManager} from './components/DeviceManager';
import RenewDialog from './components/RenewDialog';

const AcceleratorOrderManagement = () => {
  // 状态管理
  const [deviceDialog, setDeviceDialog] = useState({ open: false, order: null });
  const [renewDialog, setRenewDialog] = useState({ open: false, order: null });

  // 使用自定义hooks
  const {
    orders,
    total,
    stats,
    isLoading,
    page,
    pageSize,
    searchQuery,
    orderStatus,
    version,
    duration,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleStatusChange,
    handleVersionChange,
    handleDurationChange,
    refresh,
  } = useOrderList();

  const {
    handleRenew,
    handleUpdateStatus,
    isRenewing,
    isUpdatingStatus,
  } = useOrderActions();

  // 处理设备管理
  const handleManageDevices = (order: AcceleratorOrder) => {
    setDeviceDialog({ open: true, order });
  };

  // 处理续期
  const handleRenewOrder = (order: AcceleratorOrder) => {
    setRenewDialog({ open: true, order });
  };
console.log(orders,stats)
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">加速器订单管理</h1>
          <p className="text-gray-500">管理和处理加速器订单</p>
        </div>
      </div>

      {/* Stats */}
      {/* {stats && <OrderStats stats={stats} />} */}

      {/* Filters */}
      <div className="my-6">
        <OrderFilters 
          searchQuery={searchQuery}
          orderStatus={orderStatus}
          version={version}
          duration={duration}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onVersionChange={handleVersionChange}
          onDurationChange={handleDurationChange}
          onRefresh={refresh}
        />
      </div>

      {/* Table */}
      <OrderTable 
        orders={orders}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onManageDevices={handleManageDevices}
        onRenew={handleRenewOrder}
      />

      {/* Device Management Dialog */}
      <Dialog
        open={deviceDialog.open}
        onOpenChange={(open) => !open && setDeviceDialog({ open, order: null })}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>设备管理</DialogTitle>
          </DialogHeader>
          {deviceDialog.order && (
            <DeviceManager 
              order={deviceDialog.order}
              onClose={() => setDeviceDialog({ open: false, order: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog
        open={renewDialog.open}
        onOpenChange={(open) => !open && setRenewDialog({ open, order: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>订单续期</DialogTitle>
          </DialogHeader>
          {renewDialog.order && (
            <RenewDialog
              order={renewDialog.order}
              isLoading={isRenewing}
              onConfirm={async (duration) => {
                const success = await handleRenew(renewDialog.order.id, duration);
                if (success) {
                  setRenewDialog({ open: false, order: null });
                }
              }}
              onClose={() => setRenewDialog({ open: false, order: null })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcceleratorOrderManagement;