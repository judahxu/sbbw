// components/dialogs/ResetKeyDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { APIOrder } from "../../types";

interface ResetKeyDialogProps {
  open: boolean;
  order: APIOrder | null;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
}

export function ResetKeyDialog({
  open,
  order,
  onClose,
  onConfirm
}: ResetKeyDialogProps) {
  const [reason, setReason] = useState('');

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重置API Key</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>
              重置API Key后，原有的Key将立即失效，请确保已备份相关数据。
            </AlertDescription>
          </Alert>

          <div>
            <Label>重置原因</Label>
            <Input 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入重置原因"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            variant="destructive"
            onClick={() => {
              onConfirm(order.id, reason);
              onClose();
            }}
            disabled={!reason}
          >
            确认重置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}