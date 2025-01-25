// components/dialogs/RenewalDialog.tsx
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
import { formatDateTime } from "../../utils";

interface RenewalDialogProps {
  open: boolean;
  order: APIOrder | null;
  onClose: () => void;
  onConfirm: (orderId: string, duration: string) => void;
}

export function RenewalDialog({
  open,
  order,
  onClose,
  onConfirm
}: RenewalDialogProps) {
  const [duration, setDuration] = useState('7d');

  if (!order) return null;

  const durationPackages = [
    { value: '7d', label: '7天', price: 199 },
    { value: '15d', label: '15天', price: 369 },
    { value: '30d', label: '30天', price: 699 }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>续期API Key</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>当前API Key</Label>
            <div className="font-mono mt-1 text-sm">
              {order.apiKey.slice(0, 32)}...
            </div>
          </div>

          <div>
            <Label>到期时间</Label>
            <div className="mt-1">
              {formatDateTime(order.expiresAt)}
            </div>
          </div>

          <div>
            <Label>选择续期时长</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="选择续期时长" />
              </SelectTrigger>
              <SelectContent>
                {durationPackages.map(pkg => (
                  <SelectItem key={pkg.value} value={pkg.value}>
                    {pkg.label} (¥{pkg.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 rounded-md bg-gray-50 p-3">
            <p>续期价格：</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {durationPackages.map(pkg => (
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
              onConfirm(order.id, duration);
              onClose();
            }}
          >
            确认续期
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}