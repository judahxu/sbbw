'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from '../../components/Button';

interface PricingOption {
  value: string;
  label: string;
  price: number;
  description?: string;
}

interface ProductConfig {
  type: string;
  basePrice: number;
  options: {
    id: string;
    name: string;
    required?: boolean;
    dependsOn?: {
      field: string;
      value: string;
    };
    options: PricingOption[];
  }[];
}

const ProductConfigurator: React.FC<{ 
  product: ProductConfig;
  onPriceChange?: (price: number) => void;
}> = ({ product, onPriceChange }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(product.basePrice);

  // 计算是否显示某个选项
  const shouldShowOption = (option: typeof product.options[0]) => {
    if (!option.dependsOn) return true;
    return selectedOptions[option.dependsOn.field] === option.dependsOn.value;
  };

  // 计算总价
  useEffect(() => {
    let price = product.basePrice;
    Object.entries(selectedOptions).forEach(([optionId, selectedValue]) => {
      const option = product.options.find(opt => opt.id === optionId);
      const selectedOpt = option?.options.find(opt => opt.value === selectedValue);
      if (selectedOpt) {
        price += selectedOpt.price;
      }
    });
    setTotalPrice(price);
    onPriceChange?.(price);
  }, [selectedOptions, product, onPriceChange]);

  // 处理选项变更
  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev, [optionId]: value };
      
      // 清除依赖该选项的其他选择
      product.options.forEach(option => {
        if (option.dependsOn?.field === optionId && option.dependsOn.value !== value) {
          delete newOptions[option.id];
        }
      });
      
      return newOptions;
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{product.type}</span>
          <span className="text-2xl font-bold">¥{totalPrice}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {product.options.map((option) => (
            shouldShowOption(option) && (
              <div key={option.id} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {option.name}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {option.options.map((choice) => (
                    <label
                      key={choice.value}
                      className={`
                        relative block p-4 cursor-pointer rounded-lg border
                        ${selectedOptions[option.id] === choice.value
                          ? 'border-black bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={option.id}
                        value={choice.value}
                        checked={selectedOptions[option.id] === choice.value}
                        onChange={() => handleOptionChange(option.id, choice.value)}
                        className="sr-only"
                      />
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{choice.label}</p>
                          {choice.description && (
                            <p className="text-sm text-gray-500">{choice.description}</p>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {choice.price > 0 && `+¥${choice.price}`}
                          {choice.price < 0 && `-¥${Math.abs(choice.price)}`}
                          {choice.price === 0 && '包含'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          ))}
          
          <div className="pt-4">
            <Button title="立即购买" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductConfigurator;