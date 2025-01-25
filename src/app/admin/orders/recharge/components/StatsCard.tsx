// components/StatsCards.tsx
'use client'
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const StatsCard = ({ 
  title, 
  value, 
  subValue, 
  color = "gray", 
  icon 
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold text-${color}-600`}>
              {value}
            </div>
            {subValue && (
              <div className="text-sm text-gray-500">{subValue}</div>
            )}
          </div>
          {icon && (
            <div className={`text-${color}-600`}>{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

