// src/components/orders/modals/OrderDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Order } from '@/types/orders';

interface OrderDetailModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
}

export function OrderDetailModal({
  open,
  order,
  onClose
}: OrderDetailModalProps) {
  // 订单类型显示
  const getTypeDisplay = (type: Order['type']) => {
    const typeMap = {
      acceleration: '加速服务',
      appleId: '美区账号',
      recharge: '充值服务'
    };
    return typeMap[type];
  };

  // 订单状态显示
  const getStatusDisplay = (status: Order['status']) => {
    const statusMap = {
      pending_payment: '待支付',
      paid: '已支付',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
      refunded: '已退款'
    };
    return statusMap[status];
  };

  // 获取服务特定信息
  const getServiceSpecificInfo = () => {
    switch (order.type) {
      case 'acceleration':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">服务配置信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">服务类型</div>
                <div>{order.plan === 'monthly' ? '月付' : order.plan === 'quarterly' ? '季付' : '年付'}</div>
                {order.configuration && (
                  <>
                    <div className="text-muted-foreground">服务器</div>
                    <div>{order.configuration.server}</div>
                    <div className="text-muted-foreground">端口</div>
                    <div>{order.configuration.port}</div>
                    <div className="text-muted-foreground">密码</div>
                    <div>{order.configuration.password}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'appleId':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">账号信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.account ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">账号邮箱</div>
                  <div>{order.account.email}</div>
                  <div className="text-muted-foreground">账号密码</div>
                  <div>{order.account.password}</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">账号尚未分配</p>
              )}
            </CardContent>
          </Card>
        );

      case 'recharge':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">充值信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">充值金额(USD)</div>
                <div>${order.usdAmount}</div>
                <div className="text-muted-foreground">汇率</div>
                <div>{order.exchangeRate}</div>
                <div className="text-muted-foreground">充值账号</div>
                <div>{order.appliedAccount}</div>
                {order.giftCardCode && (
                  <>
                    <div className="text-muted-foreground">礼品卡代码</div>
                    <div>{order.giftCardCode}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">订单号：{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      创建时间：{new Date(order.createTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      更新时间：{new Date(order.updateTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge className="ml-2">
                      {getTypeDisplay(order.type)}
                    </Badge>
                    <Badge 
                      variant={order.status === 'completed' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {getStatusDisplay(order.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 用户信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">用户信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">用户ID</div>
                  <div>{order.userId}</div>
                  <div className="text-muted-foreground">用户邮箱</div>
                  <div>{order.userEmail}</div>
                </div>
              </CardContent>
            </Card>

            {/* 金额信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">金额信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">支付金额</div>
                  <div className="font-medium">¥{order.amount}</div>
                </div>
              </CardContent>
            </Card>

            {/* 服务特定信息 */}
            {getServiceSpecificInfo()}

            {/* 备注信息 */}
            {order.remark && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">处理备注</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.remark}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}