import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// 资源池状态展示组件
const ResourcePoolStatus = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          加速器配置池状态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">128/150</div>
            <p className="text-xs text-muted-foreground">可用/总数</p>
          </div>
          <Button variant="outline" size="sm">
            添加配置
          </Button>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          美区账号池状态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">45/50</div>
            <p className="text-xs text-muted-foreground">可用/总数</p>
          </div>
          <Button variant="outline" size="sm">
            添加账号
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// 订单处理组件
const OrderProcessing = () => {
  return (
    <div className="p-6">
      <ResourcePoolStatus />
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">待处理订单</TabsTrigger>
          <TabsTrigger value="manual">人工处理队列</TabsTrigger>
          <TabsTrigger value="completed">最近完成</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单编号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>等待时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 自动分配待处理订单 */}
                  <TableRow>
                    <TableCell>ORD001</TableCell>
                    <TableCell>
                      <Badge variant="outline">加速服务</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 text-yellow-500" />
                        等待分配
                      </div>
                    </TableCell>
                    <TableCell>2024-01-26 14:30</TableCell>
                    <TableCell>5分钟</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        手动分配
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* 充值服务订单 */}
                  <TableRow>
                    <TableCell>ORD002</TableCell>
                    <TableCell>
                      <Badge variant="outline">充值服务</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        待处理
                      </div>
                    </TableCell>
                    <TableCell>2024-01-26 14:25</TableCell>
                    <TableCell>10分钟</TableCell>
                    <TableCell>
                      <Button variant="default" size="sm">
                        处理订单
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardContent>
              <div className="space-y-4">
                {/* 手动处理订单示例 */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">订单号：ORD003</h3>
                      <p className="text-sm text-muted-foreground">充值服务 - $50 礼品卡</p>
                    </div>
                    <Badge variant="secondary">处理中</Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">充值码</label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="输入礼品卡代码" />
                        <Button>确认</Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>用户账号：user@example.com</p>
                      <p>创建时间：2024-01-26 14:20</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单编号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>完成时间</TableHead>
                    <TableHead>处理方式</TableHead>
                    <TableHead>操作人</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>ORD004</TableCell>
                    <TableCell>
                      <Badge variant="outline">美区账号</Badge>
                    </TableCell>
                    <TableCell>2024-01-26 14:15</TableCell>
                    <TableCell>
                      <Badge variant="secondary">自动分配</Badge>
                    </TableCell>
                    <TableCell>System</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ORD005</TableCell>
                    <TableCell>
                      <Badge variant="outline">充值服务</Badge>
                    </TableCell>
                    <TableCell>2024-01-26 14:10</TableCell>
                    <TableCell>
                      <Badge variant="secondary">人工处理</Badge>
                    </TableCell>
                    <TableCell>Admin001</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderProcessing;