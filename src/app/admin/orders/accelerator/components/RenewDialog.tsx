// components/RenewDialog.tsx
'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AcceleratorOrder,formatDateTime,DURATION_OPTIONS } from '../utils';

interface RenewDialogProps {
  order: AcceleratorOrder;
  isLoading: boolean;
  onConfirm: (duration: string) => void;
  onClose: () => void;
}

const RenewDialog = ({ order, isLoading, onConfirm, onClose }: RenewDialogProps) => {
  const [duration, setDuration] = useState(DURATION_OPTIONS.MONTHLY);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">当前到期时间</p>
        <p className="text-lg">{formatDateTime(order.endTime)}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">续期时长</label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue placeholder="选择续期时长" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DURATION_OPTIONS.MONTHLY}>1个月 (¥19.9)</SelectItem>
            <SelectItem value={DURATION_OPTIONS.QUARTERLY}>3个月 (¥49.9)</SelectItem>
            <SelectItem value={DURATION_OPTIONS.YEARLY}>12个月 (¥168)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium">费用预览</h4>
        <div className="flex justify-between text-sm">
          <span>基础费用</span>
          <span>{
            duration === DURATION_OPTIONS.MONTHLY ? '¥19.9' :
            duration === DURATION_OPTIONS.QUARTERLY ? '¥49.9' :
            '¥168'
          }</span>
        </div>
        {order.version === 'team' && (
          <div className="flex justify-between text-sm">
            <span>团队版附加费</span>
            <span>{
              duration === DURATION_OPTIONS.MONTHLY ? '¥30' :
              duration === DURATION_OPTIONS.QUARTERLY ? '¥80' :
              '¥231'
            }</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-2 mt-2">
          <span>合计</span>
          <span className="text-lg">{
            order.version === 'team' 
              ? (duration === DURATION_OPTIONS.MONTHLY ? '¥49.9' :
                 duration === DURATION_OPTIONS.QUARTERLY ? '¥129.9' :
                 '¥399')
              : (duration === DURATION_OPTIONS.MONTHLY ? '¥19.9' :
                 duration === DURATION_OPTIONS.QUARTERLY ? '¥49.9' :
                 '¥168')
          }</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button 
          onClick={() => onConfirm(duration)}
          disabled={isLoading}
        >
          确认续期
        </Button>
      </div>
    </div>
  );
};

export default RenewDialog;