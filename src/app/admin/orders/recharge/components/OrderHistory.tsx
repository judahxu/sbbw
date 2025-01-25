'use client';
import { api } from '@/trpc/react';
import { useEffect, useState } from 'react';


interface OrderHistoryProps {
  orderId: string;
}

export const OrderHistory = ({ orderId }: OrderHistoryProps) => {
  const { data: history } = api.order.getHistory.useQuery(
    { orderId },
    { enabled: !!orderId }
  );

  if (!history?.length) return null;

  return (
    <div className="space-y-2">
      {history.map((record, index) => (
        <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
          <span className="text-gray-600">{record.content}</span>
          <span className="text-gray-400">
            {new Date(record.createdAt).toLocaleString()} · {record.operatorName}
          </span>
        </div>
      ))}
    </div>
  );
};

