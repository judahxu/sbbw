// components/OrderTable.tsx
'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusRechargeOrder } from '../types';

interface OrderTableProps {
  orders: PlusRechargeOrder[];
  onProcess: (order: PlusRechargeOrder) => void;
}

export function OrderTable({ orders, onProcess }: OrderTableProps) {
  // Get status badge style
  const getStatusBadge = (status: string) => {
    const styles = {
      pending_payment: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      retry_needed: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };

    const labels = {
      pending_payment: "待付款",
      processing: "充值中",
      retry_needed: "需要重试",
      completed: "已完成", 
      failed: "充值失败"
    };

    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>OpenAI账号</TableHead>
            <TableHead>联系方式</TableHead>
            <TableHead>充值金额</TableHead>
            <TableHead>订阅时长</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>处理人</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{order.account.email}</TableCell>
              <TableCell>{order.contact}</TableCell>
              <TableCell>${order.amountUsd} / ¥{order.amountCny}</TableCell>
              <TableCell>{order.subscription}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{order.operator || '-'}</TableCell>
              <TableCell>{order.createdAt}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onProcess(order)}
                >
                  处理
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}