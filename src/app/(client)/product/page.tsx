'use client'
import React, { useState } from 'react';
import HomeLink from '../../components/HomeLink';
import LoginLink from '../../components/LoginLink';
import ProductConfigurator from './ProductConfigurator';
import RecommendedPlans from './RecommendedPlan';
import { api } from "~/trpc/react";
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BuyPage() {
  const [selectedProduct, setSelectedProduct] = useState('chatgpt');

  const [pageMode, setPageMode] = useState<'plans' | 'custom'>('plans');
  const router = useRouter();

  const { data: bundlesData, isLoading } = api.bundle.list.useQuery({
    status: 'active',
    page: 1,
    pageSize: 10
  });

  const recommendedPlans = bundlesData?.items.map(bundle => ({
    id: bundle.id,
    title: bundle.name,
    description: bundle.description,
    price: bundle.salePrice,
    originalPrice: bundle.originalPrice,
    tag: bundle.tag || undefined,
    features: bundle.features
  })) || [];


  // 套餐选择处理
  const handleSelectBundle = (bundleId: number) => {
    console.log(111,bundleId)
    router.push(`/buy?type=bundle&id=${bundleId}`);
  };

  // 自选配置提交处理
  const handleCustomSubmit = (config: any) => {
    // 序列化配置数据
    const configStr = encodeURIComponent(JSON.stringify(config));
    router.push(`/buy?type=custom&config=${configStr}`);
  };


  // const recommendedPlans = [
  //   {
  //     title: "畅享套餐",
  //     description: "永久账号 + 365天加速器",
  //     price: 399,
  //     originalPrice: 499,
  //     tag: "最热",
  //     features: [
  //       { label: "永久账号所有权", included: true },
  //       { label: "365天加速器服务", included: true },
  //       { label: "支持更换密码", included: true },
  //       { label: "优先技术支持", included: true },
  //       { label: "GPT4使用额度", included: false }
  //     ]
  //   },
  //   {
  //     title: "Plus尊享套餐",
  //     description: "Plus账号 + 180天加速器",
  //     price: 799,
  //     originalPrice: 999,
  //     features: [
  //       { label: "永久账号所有权", included: true },
  //       { label: "180天加速器服务", included: true },
  //       { label: "3个月Plus订阅", included: true },
  //       { label: "GPT4使用额度", included: true },
  //       { label: "优先技术支持", included: true }
  //     ]
  //   },
  //   {
  //     title: "体验套餐",
  //     description: "临时账号 + 加速器",
  //     price: 99,
  //     originalPrice: 159,
  //     features: [
  //       { label: "30天使用权限", included: true },
  //       { label: "30天加速器", included: true },
  //       { label: "基础技术支持", included: true },
  //       { label: "到期自动失效", included: true },
  //       { label: "GPT4使用额度", included: false }
  //     ]
  //   }
  // ];

  const products = {
    chatgpt: {
      type: "ChatGPT账号",
      basePrice: 99,
      options: [
        {
          id: "ownership",
          name: "账号类型",
          required: true,
          options: [
            {
              value: "permanent",
              label: "永久账号",
              price: 0,
              description: "账号归您所有，可自行管理和更改密码"
            },
            {
              value: "temporary",
              label: "临时账号",
              price: -79,
              description: "使用期限内可用，到期自动失效"
            }
          ]
        },
        {
          id: "duration",
          name: "使用时长",
          required: true,
          dependsOn: {
            field: "ownership",
            value: "temporary"
          },
          options: [
            {
              value: "7d",
              label: "7天体验",
              price: 0,
              description: "含7天加速器"
            },
            {
              value: "15d",
              label: "15天使用",
              price: 20,
              description: "含15天加速器"
            },
            {
              value: "30d",
              label: "30天使用",
              price: 45,
              description: "含30天加速器"
            }
          ]
        },
        {
          id: "plus_subscription",
          name: "Plus订阅",
          options: [
            {
              value: "no",
              label: "不需要Plus",
              price: 0,
              description: "仅使用GPT-3.5功能"
            },
            {
              value: "yes",
              label: "订阅Plus",
              price: 0,
              description: "使用GPT-4和其他高级功能，最少订阅1个月"
            }
          ]
        },
        {
          id: "plus_duration",
          name: "Plus订阅时长（最少1个月）",
          dependsOn: {
            field: "plus_subscription",
            value: "yes"
          },
          options: [
            {
              value: "1m",
              label: "1个月",
              price: 138,
              description: "月付订阅，按月续费"
            },
            {
              value: "3m",
              label: "3个月",
              price: 399,
              description: "季付优惠，约合133元/月"
            },
            {
              value: "6m",
              label: "6个月",
              price: 759,
              description: "半年特惠，约合126.5元/月"
            }
          ]
        },
        {
          id: "accelerator",
          name: "加速器服务",
          dependsOn: {
            field: "ownership",
            value: "permanent"
          },
          options: [
            {
              value: "none",
              label: "不需要加速器",
              price: 0,
              description: "已有其他稳定访问方式"
            },
            {
              value: "30d",
              label: "30天加速",
              price: 30,
              description: "适合短期使用"
            },
            {
              value: "90d",
              label: "90天加速",
              price: 80,
              description: "季度套餐更优惠"
            },
            {
              value: "365d",
              label: "365天加速",
              price: 300,
              description: "年付最划算"
            }
          ]
        }
      ]
    },
    accelerator: {
      type: "单独购买加速器",
      basePrice: 0,
      options: [
        {
          id: "type",
          name: "版本选择",
          required: true,
          options: [
            {
              value: "personal",
              label: "个人版",
              price: 19.9,
              description: "2台设备同时在线"
            },
            {
              value: "team",
              label: "团队版",
              price: 49.9,
              description: "5台设备同时在线"
            }
          ]
        },
        {
          id: "duration",
          name: "使用时长",
          required: true,
          options: [
            {
              value: "1m",
              label: "月付",
              price: 0,
              description: "灵活使用"
            },
            {
              value: "3m",
              label: "季付",
              price: -9.8,
              description: "约合16.7元/月"
            },
            {
              value: "12m",
              label: "年付",
              price: -70.8,
              description: "约合8.2元/月"
            }
          ]
        }
      ]
    },
    recharge: {
      type: "充值服务",
      basePrice: 0,
      options: [
        {
          id: "type",
          name: "充值类型",
          required: true,
          options: [
            {
              value: "plus",
              label: "Plus月度订阅",
              price: 138,
              description: "$20/月（实时汇率+3%）"
            },
            {
              value: "api",
              label: "API充值",
              price: 0,
              description: "选择充值金额"
            }
          ]
        },
        {
          id: "api_amount",
          name: "API充值金额",
          dependsOn: {
            field: "type",
            value: "api"
          },
          options: [
            {
              value: "5",
              label: "$5起充",
              price: 35,
              description: "实时汇率+5%"
            },
            {
              value: "20",
              label: "$20起充",
              price: 138,
              description: "实时汇率+4%"
            },
            {
              value: "50",
              label: "$50起充",
              price: 345,
              description: "实时汇率+3%"
            },
            {
              value: "100",
              label: "$100起充",
              price: 690,
              description: "实时汇率+2%"
            }
          ]
        }
      ]
    }
  };


  //  主要Tab样式处理
   const getMainTabClass = (mode: 'plans' | 'custom') => `
   px-8 py-3 text-lg font-semibold rounded-lg transition-colors 
   ${pageMode === mode
     ? 'bg-black text-white shadow-md'
     : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
   }
 `;
  const getTabClass = (tab: string) => 
    `px-6 py-2 rounded-lg transition-colors ${
      selectedProduct === tab
        ? 'bg-black text-white'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`;

  return (
    <main className="flex flex-col items-center justify-start w-full">
      <div className="mt-16 w-full max-w-7xl">
      <div className="flex justify-center space-x-6 mb-12">
          <button
            onClick={() => setPageMode('plans')}
            className={getMainTabClass('plans')}
          >
            推荐套餐
          </button>
          <button
            onClick={() => setPageMode('custom')}
            className={getMainTabClass('custom')}
          >
            自选配置
          </button>
        </div>
        {/* 推荐套餐部分 */}
        <section className={pageMode === 'plans' ? 'block' : 'hidden'}>
          {/* <h1 className="text-3xl font-bold text-center mb-8">推荐套餐</h1> */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <RecommendedPlans plans={recommendedPlans} onSelect={handleSelectBundle} />
          )}
        </section>

        {/* 产品选择部分 */}
        <section className={pageMode == 'custom' ? 'block' : 'hidden'}>
          {/* <h1 className="text-3xl font-bold text-center mb-8">自选配置</h1> */}
          <div className="flex justify-center space-x-4 mb-8">
            {/* <button
              onClick={() => setSelectedProduct('recommended')}
              className={getTabClass('recommended')}
            >
              推荐套餐
            </button> */}
            <button
              onClick={() => setSelectedProduct('chatgpt')}
              className={getTabClass('chatgpt')}
            >
              ChatGPT账号
            </button>
            <button
              onClick={() => setSelectedProduct('accelerator')}
              className={getTabClass('accelerator')}
            >
              加速器
            </button>
            <button
              onClick={() => setSelectedProduct('recharge')}
              className={getTabClass('recharge')}
            >
              充值服务
            </button>
          </div>

          <div className="flex justify-center">
            {selectedProduct !== 'recommended' && (
              <ProductConfigurator product={products[selectedProduct]} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}