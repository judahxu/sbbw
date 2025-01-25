import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Button from '../components/Button';

interface PricingTier {
  duration: string;
  price: string;
  features?: string[];
}

interface ProductCardProps {
  title: string;
  description: string;
  pricing: PricingTier[];
  type: 'permanent' | 'temporary';
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, pricing, type }) => {
  return (
    <Card className="w-full max-w-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {title}
          {type === 'permanent' && 
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">永久</span>
          }
          {type === 'temporary' && 
            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">临时</span>
          }
        </CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {pricing.map((tier, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{tier.duration}</span>
                <span className="text-lg font-bold text-gray-900">¥{tier.price}</span>
              </div>
              {tier.features && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <Button title="立即购买" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;