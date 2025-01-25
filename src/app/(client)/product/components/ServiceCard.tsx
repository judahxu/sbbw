// src/components/ServiceCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  price: {
    amount: number;
    unit: string;
  };
  documentation: string;
  relatedServices?: {
    title: string;
    description: string;
  }[];
}

export function ServiceCard({
  title,
  description,
  features,
  price,
  documentation,
  relatedServices
}: ServiceCardProps) {
  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="h-5 w-5 text-green-500 flex-shrink-0">✓</div>
                <p className="text-sm text-gray-600">{feature}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <p className="text-3xl font-bold">
              ¥{price.amount}
              <span className="text-base font-normal text-gray-600">/{price.unit}</span>
            </p>
          </div>

          {relatedServices && relatedServices.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Info className="w-4 h-4" />
                推荐搭配使用
              </p>
              <div className="flex flex-wrap gap-2">
                {relatedServices.map((service, index) => (
                  <Badge key={index} variant="secondary" className="cursor-help" title={service.description}>
                    {service.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full">立即购买</Button>
        <Button variant="outline" className="w-full" onClick={() => window.open(documentation, '_blank')}>
          了解更多
        </Button>
      </CardFooter>
    </Card>
  );
}