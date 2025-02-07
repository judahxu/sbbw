// app/(admin)/dashboard/page.tsx
'use client'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from "lucide-react";

// 数据统计组件
function StatsCard({ title, value, description }: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// 图表类型
type ChartType = 'revenue' | 'orders';
type TimeRange = 'weekly' | 'monthly';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chartType, setChartType] = useState<ChartType>('revenue');
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  // 获取统计数据
  const { data: stats, isLoading: isStatsLoading } = api.dashboard.getStats.useQuery();
  
  // 获取图表数据
  const { data: chartData, isLoading: isChartLoading } = api.dashboard.getChartData.useQuery({
    type: chartType,
    range: timeRange
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || isStatsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">仪表盘</h2>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="总收入" 
          value={`¥${stats?.totalRevenue.toLocaleString()}`} 
        />
        <StatsCard 
          title="总订单数" 
          value={stats?.totalOrders.toLocaleString() ?? 0} 
        />
        <StatsCard 
          title="总账号数" 
          value={`${stats?.totalAccounts.toLocaleString() ?? 0}`}
          description={`美区账号: ${stats?.appleIdAccounts ?? 0} | 加速器: ${stats?.acceleratorAccounts ?? 0}`}
        />
        <StatsCard 
          title="剩余库存" 
          value={`${stats?.availableAccounts.toLocaleString() ?? 0}`}
          description={`美区账号: ${stats?.availableAppleIds ?? 0} | 加速器: ${stats?.availableAccelerators ?? 0}`}
        />
      </div>

      {/* 图表区域 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>数据趋势</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={chartType}
              onValueChange={(value: ChartType) => setChartType(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">收入统计</SelectItem>
                <SelectItem value="orders">订单统计</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={timeRange}
              onValueChange={(value: TimeRange) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">按周</SelectItem>
                <SelectItem value="monthly">按月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  name={chartType === 'revenue' ? '收入' : '订单数'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}