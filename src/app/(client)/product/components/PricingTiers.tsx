// src/components/PricingTiers.tsx
'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PricingTier {
  period: string;
  price: number;
  originalPrice?: number;
  unit: string;
  recommended?: boolean;
}

interface PricingTiersProps {
  tiers: PricingTier[];
  onSelect: (tier: PricingTier) => void;
  selectedTier: PricingTier;
}

export function PricingTiers({ tiers, onSelect, selectedTier }: PricingTiersProps) {
  return (
    <RadioGroup
      className="grid gap-4"
      defaultValue={selectedTier.period}
      onValueChange={(value) => {
        const tier = tiers.find(t => t.period === value);
        if (tier) onSelect(tier);
      }}
    >
      {tiers.map((tier) => (
        <div key={tier.period} className="relative">
          <RadioGroupItem
            value={tier.period}
            id={tier.period}
            className="peer sr-only"
          />
          <Label
            htmlFor={tier.period}
            className="flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:border-primary peer-checked:border-primary"
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">{tier.period}</span>
              <div className="text-right">
                <span className="text-2xl font-bold">¥{tier.price}</span>
                <span className="text-sm text-gray-500">/{tier.unit}</span>
                {tier.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    原价: ¥{tier.originalPrice}/{tier.unit}
                  </div>
                )}
              </div>
            </div>
            {tier.recommended && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                推荐
              </span>
            )}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

// 充值服务费用计算组件
interface RechargeCalculatorProps {
  exchangeRate: number;
  serviceFee: number;
}

export function RechargeCalculator({ exchangeRate, serviceFee }: RechargeCalculatorProps) {
  const [amount, setAmount] = React.useState(20); // 最小20美金

  const calculateTotal = () => {
    const baseAmount = amount * exchangeRate;
    const feeAmount = baseAmount * (serviceFee / 100);
    return {
      base: baseAmount.toFixed(2),
      fee: feeAmount.toFixed(2),
      total: (baseAmount + feeAmount).toFixed(2)
    };
  };

  const calculation = calculateTotal();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>充值金额（美金）</Label>
        <input
          type="number"
          min="20"
          value={amount}
          onChange={(e) => setAmount(Math.max(20, Number(e.target.value)))}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>汇率：1美金 = {exchangeRate}人民币</p>
        <p>基础金额：¥{calculation.base}</p>
        <p>服务费({serviceFee}%)：¥{calculation.fee}</p>
        <p className="text-lg font-bold text-black">总计：¥{calculation.total}</p>
      </div>
    </div>
  );
}