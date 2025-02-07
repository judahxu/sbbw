// src/app/(admin)/product/config/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BadgeDollarSign, DollarSign, History, Settings, RefreshCcw, Loader2 } from 'lucide-react';
import { api } from '@/trpc/react';

interface CronResponse {
  status: boolean;
}

// 价格卡片组件
const PriceCard = ({ 
  id, 
  title, 
  originalPrice, 
  currentPrice, 
  cycle, 
  lastUpdated,
  onUpdate 
}: {
  id: string;
  title: string;
  originalPrice: number;
  currentPrice: number;
  cycle: string;
  lastUpdated: string;
  onUpdate: (data: { id: string; original_price: number; current_price: number }) => void;
}) => {
  const [newOriginalPrice, setNewOriginalPrice] = React.useState(originalPrice);
  const [newCurrentPrice, setNewCurrentPrice] = React.useState(currentPrice);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSubmit = () => {
    onUpdate({
      id,
      original_price: newOriginalPrice,
      current_price: newCurrentPrice
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>上次更新：{new Date(lastUpdated).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>原价</Label>
            <span className="text-gray-500 line-through">¥{originalPrice}/{cycle}</span>
          </div>
          <div className="flex justify-between">
            <Label>现价</Label>
            <span className="text-2xl font-bold">¥{currentPrice}/{cycle}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full">修改价格</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>修改{title}价格</AlertDialogTitle>
              <AlertDialogDescription>
                请输入新的价格信息
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>原价（¥/{cycle}）</Label>
                <Input 
                  type="number" 
                  value={newOriginalPrice} 
                  onChange={(e) => setNewOriginalPrice(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>现价（¥/{cycle}）</Label>
                <Input 
                  type="number" 
                  value={newCurrentPrice}
                  onChange={(e) => setNewCurrentPrice(Number(e.target.value))}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
              <Button onClick={handleSubmit}>确认修改</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default function ProductPage() {
  const router = useRouter();

  const handleInitCron = async () => {
    try {
      const response = await fetch('/api/cron');
      const data = (await response.json()) as CronResponse;
      if (data.status) {
        // toast.success('定时任务初始化成功');
      }
    } catch (error) {
      // toast.error('定时任务初始化失败');
    }
  };
 
  React.useEffect(() => {
    void handleInitCron();
  }, []); // Move handleInitCron call to useEffect


  // 获取所有配置
  const { data: configs, isLoading, refetch } = api.config.getAll.useQuery();
  
  // 更新配置的mutation
  const { mutate: updateConfig } = api.config.update.useMutation({
    onSuccess: () => {
      toast.success('更新成功');
      void refetch();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    }
  });

  // 更新汇率的mutation
  const { mutate: updateRate } = api.config.updateExchangeRate.useMutation({
    onSuccess: () => {
      toast.success('汇率更新成功');
      void refetch();
    },
    onError: (error) => {
      toast.error(`汇率更新失败: ${error.message}`);
    }
  });

  // 更新服务费的mutation
  const { mutate: updateFee } = api.config.updateServiceFee.useMutation({
    onSuccess: () => {
      toast.success('服务费更新成功');
      void refetch();
    },
    onError: (error) => {
      toast.error(`服务费更新失败: ${error.message}`);
    }
  });

  const accelerationConfigs = configs?.filter(config => config.type === 'acceleration') ?? [];
  const appstoreConfig = configs?.find(config => config.type === 'appstore');
  const exchangeRateConfig = configs?.find(config => config.type === 'exchange_rate');
  const serviceFeeConfig = configs?.find(config => config.type === 'service_fee');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const handleUpdateConfig = (data: { id: string; original_price: number; current_price: number }) => {
    updateConfig(data);
  };

  const handleUpdateRate = (rate: number) => {
    updateRate({ rate });
  };

  const handleUpdateFee = (data: { percentage: number; minimum_fee?: number; maximum_fee?: number }) => {
    updateFee(data);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">产品价格管理</h1>
      </div>

      {/* 汇率显示与更新区域 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5" />
            当前汇率
          </CardTitle>
          <CardDescription>
            上次更新时间：{exchangeRateConfig ? new Date(exchangeRateConfig.updated_at).toLocaleString() : '-'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-2xl font-bold">
                1 USD = ¥{Number(exchangeRateConfig?.exchange_rate)?.toFixed(2) ?? '-'} CNY
              </span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  更新汇率
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>更新汇率</AlertDialogTitle>
                  <AlertDialogDescription>
                    请输入新的汇率
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>汇率 (CNY/USD)</Label>
                    <Input 
                      type="number" 
                      defaultValue={Number(exchangeRateConfig?.exchange_rate)}
                      onChange={(e) => handleUpdateRate(Number(e.target.value))}
                    />
                  </div>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* 服务价格配置区域 */}
      <Tabs defaultValue="acceleration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="acceleration">加速服务</TabsTrigger>
          <TabsTrigger value="appstore">美区账号</TabsTrigger>
          <TabsTrigger value="recharge">充值服务</TabsTrigger>
        </TabsList>

        <TabsContent value="acceleration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accelerationConfigs.map(config => (
              <PriceCard
                key={config.id}
                id={config.id}
                title={config.name}
                originalPrice={Number(config.original_price)}
                currentPrice={Number(config.current_price)}
                cycle={config.cycle!}
                lastUpdated={config.updated_at.toLocaleDateString()}
                onUpdate={handleUpdateConfig}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appstore">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appstoreConfig && (
              <PriceCard
                id={appstoreConfig.id}
                title={appstoreConfig.name}
                originalPrice={Number(appstoreConfig.original_price)}
                currentPrice={Number(appstoreConfig.current_price)}
                cycle={appstoreConfig.cycle!}
                lastUpdated={appstoreConfig.updated_at.toLocaleTimeString()}
                onUpdate={handleUpdateConfig}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="recharge">
          <Card>
            <CardHeader>
              <CardTitle>充值服务费配置</CardTitle>
              <CardDescription>设置充值服务的手续费率</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label>服务费率（%）</Label>
                    <Input 
                      type="number" 
                      value={serviceFeeConfig?.fee_percentage ?? 5}
                      onChange={(e) => handleUpdateFee({ 
                        percentage: Number(e.target.value),
                        minimum_fee: Number(serviceFeeConfig?.minimum_fee),
                        maximum_fee: Number(serviceFeeConfig?.maximum_fee)
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>最低服务费（元）</Label>
                    <Input 
                      type="number" 
                      value={serviceFeeConfig?.minimum_fee ?? 1}
                      onChange={(e) => handleUpdateFee({
                        percentage: serviceFeeConfig?.fee_percentage?Number(serviceFeeConfig?.fee_percentage): 5,
                        minimum_fee: Number(e.target.value),
                        maximum_fee: Number(serviceFeeConfig?.maximum_fee)
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>最高服务费（元）</Label>
                    <Input 
                      type="number" 
                      value={serviceFeeConfig?.maximum_fee ?? 100}
                      onChange={(e) => handleUpdateFee({
                        percentage: Number(serviceFeeConfig?.fee_percentage),
                        minimum_fee: Number(serviceFeeConfig?.minimum_fee),
                        maximum_fee: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// INSERT INTO config (id, type, name, cycle, original_price, current_price, is_active, updated_by)
// VALUES 
// (1, 'acceleration', '加速服务月付', 'monthly', 49, 39, 1, 'system'),
// (2, 'acceleration', '加速服务季付', 'quarterly', 147, 99, 1, 'system'),
// (3, 'acceleration', '加速服务年付', 'yearly', 588, 328, 1, 'system'),
// (4, 'appstore', '美区账号', 'once', 99, 99, 1, 'system'),
// (5, 'exchange_rate', '美元汇率', NULL, NULL, NULL, 1, 'system'),
// (6, 'service_fee', '充值服务费', NULL, NULL, NULL, 1, 'system');