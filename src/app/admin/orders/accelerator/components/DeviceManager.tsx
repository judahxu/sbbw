// components/DeviceManager.tsx
'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Laptop, X, Plus } from 'lucide-react';
import { AcceleratorOrder } from '../utils';
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';


interface DeviceManagerProps {
  order: AcceleratorOrder;
  onClose: () => void;
}

const DeviceManager = ({ order, onClose }: DeviceManagerProps) => {
  const [newDeviceName, setNewDeviceName] = useState('');
  const queryClient = useQueryClient();

  // 获取设备列表
  const { data: devices, isLoading } = api.order.listDevices.useQuery(
    { orderId: order.id }
  );

  // 添加设备
  const addDeviceMutation = api.order.addDevice.useMutation({
    onSuccess: () => {
      toast.success('设备添加成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'listDevices']] });
      setNewDeviceName('');
    },
    onError: (error) => {
      toast.error(error.message || '添加设备失败');
    }
  });

  // 移除设备
  const removeDeviceMutation = api.order.removeDevice.useMutation({
    onSuccess: () => {
      toast.success('设备移除成功');
      void queryClient.invalidateQueries({ queryKey: [['order', 'listDevices']] });
    },
    onError: (error) => {
      toast.error(error.message || '移除设备失败');
    }
  });

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) {
      toast.error('请输入设备名称');
      return;
    }

    await addDeviceMutation.mutateAsync({
      serviceId: order.id,
      deviceId: crypto.randomUUID(),
      deviceName: newDeviceName.trim()
    });
  };

  const handleRemoveDevice = async (deviceId: string) => {
    await removeDeviceMutation.mutateAsync({
      serviceId: order.id,
      deviceId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">设备管理</h3>
          <p className="text-sm text-gray-500">
            当前使用 {order.currentDevices}/{order.deviceLimit} 台设备
          </p>
        </div>
        <Badge variant={order.currentDevices >= order.deviceLimit ? 'destructive' : 'default'}>
          {order.version === 'personal' ? '个人版' : '团队版'}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="输入设备名称"
          value={newDeviceName}
          onChange={(e) => setNewDeviceName(e.target.value)}
          disabled={order.currentDevices >= order.deviceLimit}
        />
        <Button
          onClick={handleAddDevice}
          disabled={order.currentDevices >= order.deviceLimit || addDeviceMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加设备
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>设备名称</TableHead>
              <TableHead>最后活跃时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices?.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Laptop className="h-4 w-4" />
                    <span>{device.deviceName}</span>
                  </div>
                </TableCell>
                <TableCell>{device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleString() : '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.deviceId)}
                    disabled={removeDeviceMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!devices?.length && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  暂无设备
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
      </div>
    </div>
  );
};



export { DeviceManager };