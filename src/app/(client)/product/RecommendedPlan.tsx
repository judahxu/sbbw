'use client'
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
interface PlanFeature {
  label: string;
  included: boolean;
}

interface RecommendedPlan {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: PlanFeature[];
  tag?: string;
}

const RecommendedPlans: React.FC<{
  plans: RecommendedPlan[];
  onSelect: (bundleId: number) => void;
}> = ({ plans, onSelect }) => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan, index) => (
        <Card 
          key={index} 
          className={`w-full relative ${
            plan.tag === '最热' ? 'border-2 border-black' : ''
          }`}
        >
          {plan.tag && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className={`
                px-4 py-1 text-sm font-semibold rounded-full
                ${plan.tag === '最热' ? 'bg-black text-white' : 'bg-gray-100'}
              `}>
                {plan.tag}
              </span>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-xl text-center">{plan.title}</CardTitle>
            <p className="text-sm text-gray-500 text-center mt-2">{plan.description}</p>
            <div className="text-center mt-4">
              <span className="text-3xl font-bold">¥{plan.price}</span>
              {plan.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ¥{plan.originalPrice}
                </span>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  {feature.included ? (
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={feature.included ? 'text-gray-900' : 'text-gray-500'}>
                    {feature.label}
                  </span>
                </li>
              ))}
            </ul>
            <Button  className="w-full bg-black text-white py-2 rounded-lg" onClick={()=>onSelect(plan.id)}>选择此套餐</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecommendedPlans;