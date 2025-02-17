// src/app/(client)/product/page.tsx
'use client';

import React from 'react';
// import { ServiceCard } from './components/ServiceCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, HelpCircle, Info,Loader2  } from 'lucide-react';
import { PricingTiers, RechargeCalculator } from './components/PricingTiers';
import { Badge } from '@/components/ui/badge';
import { useRouter, usePathname } from 'next/navigation';
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface PricingTier {
  period: string;
  price: number;
  unit: string;
  originalPrice?: number;
  recommended?: boolean;
  cycle: 'monthly' | 'quarterly' | 'yearly';
}


interface RelatedService {
  title: string;
  description: string;
}

interface Service {
  title: string;
  description: string;
  features: string[];
  hasPricingTiers?: boolean;
  hasCalculator?: boolean;
  documentation: string;
  price?: {
    amount: number;
    unit: string;
  };
  relatedServices?: RelatedService[];
}

interface RechargeCalculation {
  usdAmount: number;
  baseAmount: number;
  feeAmount: number;
  total: number;
}


// 服务流程图组件
function ServiceFlow() {
  return (
    <div className="relative py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
        {/* 连接线 - 仅在md以上显示 */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 -z-10" />
        
        {/* 场景一：访问国外应用 */}
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/3">
          <h3 className="font-bold text-lg mb-2">想用国外应用？</h3>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">1</span>
              <span>使用加速服务访问应用商店</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">2</span>
              <span>通过美区账号下载应用</span>
            </p>
          </div>
        </div>

        {/* 场景二：需要充值？ */}
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/3">
          <h3 className="font-bold text-lg mb-2">需要充值？</h3>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">1</span>
              <span>准备美区账号</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">2</span>
              <span>使用充值服务完成支付</span>
            </p>
          </div>
        </div>

        {/* 场景三：订阅服务？ */}
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/3">
          <h3 className="font-bold text-lg mb-2">想订阅服务？</h3>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">1</span>
              <span>使用加速服务访问</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">2</span>
              <span>通过充值服务订阅</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 新手引导组件
function BeginnerGuide() {
  const router = useRouter();
  
  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-12">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="text-blue-500" />
        <h2 className="text-xl font-bold">新来的？从这里开始</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</div>
          <div>
            <h3 className="font-semibold">确定你的需求</h3>
            <p className="text-gray-600">想用国外应用？需要充值？还是想订阅服务？根据你的需求选择合适的服务组合。</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</div>
          <div>
            <h3 className="font-semibold">查看推荐方案</h3>
            <p className="text-gray-600">我们为不同需求准备了推荐方案，点击下方场景查看详细建议。</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</div>
          <div>
            <h3 className="font-semibold">获取帮助</h3>
            <p className="text-gray-600">每个服务都配有详细教程，遇到问题可以随时联系客服。</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/docs/guide')}>
          查看详细新手指南
        </Button>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const [selectedTier, setSelectedTier] = React.useState<PricingTier>({
    period: '季付',
    price: 99,
    unit: '季度',
    originalPrice: 147,
    recommended: true,
    cycle:"quarterly"
  });
  // 在组件内
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();


   // 获取所有配置
   const { data: configs, isLoading } = api.config.getAll.useQuery(undefined, {
    // 保持数据新鲜度
    refetchInterval: 5 * 60 * 1000, // 5分钟刷新一次
  });
  
  // 从配置中提取所需数据
  const accelerationConfigs = React.useMemo(() => 
    configs?.filter(config => config.type === 'acceleration') ?? [], 
    [configs]
  );
  
  const exchangeRate = React.useMemo(() => 
    configs?.find(config => config.type === 'exchange_rate')?.exchange_rate ?? 7.2,
    [configs]
  );
  
  const serviceFee = React.useMemo(() => 
    configs?.find(config => config.type === 'service_fee')?.fee_percentage ?? 5,
    [configs]
  );
  
  // 处理加载状态
  // React.useEffect(() => {
  //   if (configs && accelerationConfigs.length > 0) {
  //     // 默认选择季付套餐
  //     const quarterlyTier = accelerationConfigs.find(c => c.cycle === 'quarterly');
  //     setSelectedTier(quarterlyTier ?? accelerationConfigs[0]);
  //   }
  // }, [configs, accelerationConfigs]);

  React.useEffect(() => {
    if (configs) {
      const accelerationConfigs = configs.filter(config => config.type === 'acceleration');
      const quarterlyConfig = accelerationConfigs.find(c => c.cycle === 'quarterly');
      
      if (quarterlyConfig) {
        setSelectedTier({
          period: '季付',
          price: Number(quarterlyConfig.current_price),
          unit: '季度',
          originalPrice: Number(quarterlyConfig.original_price),
          recommended: true,
          cycle: "quarterly"
        });
      }
    }
  }, [configs]);
  
  // 更新服务数据结构
  const services: Service[] = React.useMemo(() => [
    {
      title: '加速服务',
      description: '提供可靠、不间断的加速服务，让您高速、稳定地访问国外网站',
      features: [
        '全球节点分布，智能优化线路',
        '支持各类设备，简单易用',
        '24/7 技术支持服务'
      ],
      hasPricingTiers: true,
      documentation: '/docs/vpn-guide',
      relatedServices: [
        {
          title: '美区账号',
          description: '配合使用，轻松访问 App Store 美区'
        }
      ]
    },
    {
      title: '美区账号',
      description: '提供独立 App Store 美区账号，永久使用，安全可靠',
      features: [
        '正规渠道注册，安全可靠',
        '独立账号，永久使用',
        '完整的使用教程支持'
      ],
      price: {
        amount: Number(configs?.find(c => c.type === 'appstore')?.current_price) ?? 99,
        unit: '个'
      },
      documentation: '/docs/appstore-guide',
      relatedServices: [
        {
          title: '充值服务',
          description: '配合使用，轻松完成应用内购买'
        }
      ]
    },
    {
      title: '礼品卡充值',
      description: '提供 App Store 礼品卡充值服务，支持各种支付方式',
      features: [
        '支持支付宝、微信等支付方式',
        '最低充值金额：20美金',
        '专业客服指导完成充值'
      ],
      hasCalculator: true,
      documentation: '/docs/recharge-guide',
      relatedServices: [
        {
          title: '美区账号',
          description: '需要美区账号才能使用充值服务'
        }
      ]
    }
  ], [configs]);

  const [rechargeCalculation, setRechargeCalculation] = React.useState<RechargeCalculation>();
  
  // 创建订单mutation
  const { mutate: createOrder, isPending: isCreatingOrder } = api.order.createOrder.useMutation({
    onSuccess: ({ orderId }) => {
      router.push(`/buy?id=${orderId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // 处理购买
  const handlePurchase = (service: typeof services[0]) => {
    if (!session) {
      // 未登录时重定向到登录页面
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    switch (service.title) {
      case '加速服务':
        if (!selectedTier) return;
        createOrder({
          type: 'acceleration',
          plan: selectedTier.cycle,
          amount: selectedTier.price
        });
        break;

      case '美区账号':
        createOrder({
          type: 'appleId',
          amount: Number(service?.price?.amount),
        });
        break;

      case '充值服务':
        console.log(rechargeCalculation);
        if (!rechargeCalculation) return;
        createOrder({
          type: 'recharge',
          amount: rechargeCalculation.total,
          usdAmount: rechargeCalculation.usdAmount,
          exchangeRate: Number(exchangeRate),
        });
        break;
    }
  };


    // 如果还在加载配置，显示加载状态
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
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 新手引导区域 */}
        {/* <BeginnerGuide /> */}

        {/* 常见使用场景流程 */}
        {/* <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">选择你的场景</h2>
          <ServiceFlow />
        </section> */}

        {/* 服务详情区域 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">我们的服务</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
                  <CardDescription className="mt-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="h-5 w-5 text-green-500 flex-shrink-0">✓</div>
                          <p className="text-sm text-gray-600">{feature}</p>
                        </div>
                      ))}
                    </div>
                    
                    {service.hasPricingTiers && (
                      <PricingTiers
                        tiers={accelerationConfigs.map(config => ({
                          period: config.cycle === 'monthly' ? '月付' : 
                                 config.cycle === 'quarterly' ? '季付' : '年付',
                          price: Number(config.current_price),
                          unit: config.cycle === 'monthly' ? '月' : 
                                config.cycle === 'quarterly' ? '季度' : '年',
                          originalPrice: Number(config.original_price),
                          recommended: config.cycle === 'quarterly',
                          cycle: config.cycle as 'monthly' | 'quarterly' | 'yearly'
                        }))}
                        selectedTier={selectedTier}
                        onSelect={setSelectedTier}
                      />
                    )}

                    {service.hasCalculator && (
                      <RechargeCalculator
                        exchangeRate={Number(exchangeRate)}
                        serviceFee={Number(serviceFee)}
                        onCalculate={setRechargeCalculation}
                      />
                    )}

                    {service.price && (
                      <div className="mt-6">
                        <p className="text-3xl font-bold">
                          ¥{service.price.amount}
                          <span className="text-base font-normal text-gray-600">/{service.price.unit}</span>
                        </p>
                      </div>
                    )}

                    {service.relatedServices && service.relatedServices.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          推荐搭配使用
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {service.relatedServices.map((relatedService, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="cursor-help" 
                              title={relatedService.description}
                            >
                              {relatedService.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button className="w-full" disabled={isCreatingOrder} onClick={() => handlePurchase(service)}>{isCreatingOrder ? '处理中...' : '立即购买'}</Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => window.open(service.documentation, '_blank')}
                  >
                    了解更多
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* 帮助文档入口 */}
        <section className="text-center bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-8">需要帮助？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => router.push('/docs/guide')}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">新手指南</h3>
                <p className="text-gray-600">从零开始的详细教程</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => router.push('/docs/faq')}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">常见问题</h3>
                <p className="text-gray-600">解答使用过程中的困惑</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => router.push('/docs/contact')}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">联系客服</h3>
                <p className="text-gray-600">获取专业的技术支持</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}