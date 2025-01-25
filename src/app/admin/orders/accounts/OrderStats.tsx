'use client'
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { OrderStats as OrderStatsType } from './types';
import { formatCurrency } from './utils';

interface OrderStatsProps {
  stats: OrderStatsType;
  isLoading?: boolean;
}

export const OrderStats = ({ stats, isLoading = false }: OrderStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">总账号数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(stats.totalAmountCny)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">待处理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">处理中</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              {stats.processing}
            </div>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">已完成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};