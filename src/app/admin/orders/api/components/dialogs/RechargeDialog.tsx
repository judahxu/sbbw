// components/dialogs/RechargeDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { APIOrder } from "../../types";
import { formatNumber } from "../../utils";

interface RechargeDialogProps {
  open: boolean;
  order: APIOrder | null;
  onClose: () => void;
  onConfirm: (orderId: string, amount: string) => void;
}

export function RechargeDialog({
  open,
  order,
  onClose,
  onConfirm
}: RechargeDialogProps) {
  const [amount, setAmount] = useState('100k');

  if (!order) return null;

  const tokenPackages = [
    { value: '100k', label: '10万 tokens', price: 99 },
    { value: '300k', label: '30万 tokens', price: 279 },
    { value: '500k', label: '50万 tokens', price: 439 },
    { value: '1000k', label: '100万 tokens', price: 799 }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>充值Tokens</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>当前使用情况</Label>
            <div className="mt-1">
              <div className="text-sm">
                已使用: {formatNumber(order.usage.used)} tokens
              </div>
              <div className="text-sm">
                剩余: {formatNumber(order.usage.total - order.usage.used)} tokens
              </div>
            </div>
          </div>

          <div>
            <Label>选择充值包</Label>
            <Select value={amount} onValueChange={setAmount}>
              <SelectTrigger>
                <SelectValue placeholder="选择充值额度" />
              </SelectTrigger>
              <SelectContent>
                {tokenPackages.map(pkg => (
                  <SelectItem key={pkg.value} value={pkg.value}>
                    {pkg.label} (¥{pkg.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 rounded-md bg-gray-50 p-3">
            <p>充值价格：</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {tokenPackages.map(pkg => (
                <li key={pkg.value}>
                  {pkg.label} - ¥{pkg.price}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={() => {
              onConfirm(order.id, amount);
              onClose();
            }}
          >
            确认充值
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}