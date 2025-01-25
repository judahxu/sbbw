// components/APIOrderStats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface APIOrderStatsProps {
  stats: {
    total: number;
    totalAmountUsd: number;
    totalAmountCny: number;
    processing: number;
    successRate: number;
    averageProcessTime: number;
  };
}

export function APIOrderStats({ stats }: APIOrderStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">今日订单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">
              ${stats.totalAmountUsd} / ¥{stats.totalAmountCny}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">处理中</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              {stats.processing}
            </div>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">充值成功率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate}%
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageProcessTime}分钟
          </div>
        </CardContent>
      </Card>
    </div>
  );
}