'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Clock, AlertTriangle, MonitorSmartphone } from 'lucide-react';

interface OrderStatsProps {
  stats: {
    todayOrders: {
      count: number;
      amount: number;
    };
    pendingActivation: number;
    expiringCount: number;
    deviceExceeded: number;
  }
}

const OrderStats = ({ stats }: OrderStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">今日订单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold">{stats.todayOrders.count}</p>
              <p className="text-sm text-gray-500">¥{stats.todayOrders.amount.toLocaleString()}</p>
            </div>
            <Plus className="h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">待开通</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingActivation}</p>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">即将到期</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-orange-600">{stats.expiringCount}</p>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">设备超限</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-red-600">{stats.deviceExceeded}</p>
            <MonitorSmartphone className="h-4 w-4 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;