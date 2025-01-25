import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { OrderHistory } from "./OrderHistory";
import { type Order } from "../types";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export const OrderDetailDialog = ({ 
  open, 
  onOpenChange, 
  order 
}: OrderDetailDialogProps) => {
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>订单详情 - {order?.id}</DialogTitle>
        </DialogHeader>
        
        {order && (
          <div className="space-y-4 pt-4">
            {/* 账号信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">账号信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>OpenAI账号</Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <code className="flex-1 p-1 rounded bg-gray-50">
                      {order.account.email}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopy(order.account.email)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>账号密码</Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <code className="flex-1 p-1 rounded bg-gray-50">
                      {order.account.password}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopy(order.account.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 订单信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">订单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>用户邮箱</Label>
                  <div className="mt-1">{order.userEmail}</div>
                </div>
                <div>
                  <Label>联系方式</Label>
                  <div className="mt-1">{order.contact}</div>
                </div>
                <div>
                  <Label>订阅时长</Label>
                  <div className="mt-1">{order.subscription}</div>
                </div>
                <div>
                  <Label>订单金额</Label>
                  <div className="mt-1">
                    ${order.amountUsd} / ¥{order.amountCny}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 处理记录 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">处理记录</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderHistory orderId={order.id} />
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
