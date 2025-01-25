'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  Laptop,
  Users,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useQueryClient } from '@tanstack/react-query';
import { formatDuration } from "~/lib/utils";
const formSchema = z.object({
  accountId: z.string().min(1, "请输入账号ID"),
  type: z.enum(["personal", "team"]),
  duration: z.enum(["1m", "3m", "6m", "12m"]),
  userEmail: z.string().email("请输入有效的邮箱地址"),
});

const AcceleratorManagement = () => {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAccount, setShowAccount] = useState({});
  const [accountCopied, setAccountCopied] = useState({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [renewDuration, setRenewDuration] = useState("1m");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "personal",
      duration: "1m",
    }
  });

  const queryClient = useQueryClient();

   // Queries
   const { data: accounts, isLoading } = api.accelerator.list.useQuery({
    search: searchQuery,
    status: filterStatus !== 'all' ? filterStatus : undefined
  });

  const { data: stats } = api.accelerator.getStats.useQuery();

  // Mutations
  const createMutation = api.accelerator.create.useMutation({
    onSuccess: () => {
      toast.success('加速器账号创建成功');
      setCreateDialogOpen(false);
      form.reset();
      void queryClient.invalidateQueries({ queryKey: [['accelerator', 'list']] });
      void queryClient.invalidateQueries({ queryKey: [['accelerator', 'getStats']] });
    },
    onError: (error) => {
      toast.error(error.message || '创建失败');
    }
  });

  const renewMutation = api.accelerator.renew.useMutation({
    onSuccess: () => {
      toast.success('续期成功');
      setRenewDialogOpen(false);
      setSelectedAccount(null);
      void queryClient.invalidateQueries({ queryKey: [['accelerator', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || '续期失败');
    }
  });

  // 状态标签样式
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      expiring: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: '使用中',
      expired: '已过期',
      expiring: '即将到期',
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  // 套餐类型标签样式
  const getPlanTypeBadge = (planType) => {
    const styles = {
      个人版: 'bg-blue-100 text-blue-800',
      团队版: 'bg-purple-100 text-purple-800',
    };
    return <Badge className={styles[planType]}>{planType}</Badge>;
  };

  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
  });


  return (
    <div className="container mx-auto p-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">加速器账号管理</h1>
          <p className="text-gray-500">管理和监控加速器账号使用情况</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Button className="bg-black" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建账号
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总账号数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">使用中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.expiringSoon || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">设备使用情况</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.deviceUsage || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索账号ID或用户邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-md"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">使用中</SelectItem>
            <SelectItem value="expiring">即将到期</SelectItem>
            <SelectItem value="expired">已过期</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="套餐类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="personal">个人版</SelectItem>
            <SelectItem value="team">团队版</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 账号列表 */}
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>账号ID</TableHead>
              <TableHead>套餐类型</TableHead>
              <TableHead>设备限制</TableHead>
              <TableHead>已绑定设备数</TableHead>
              <TableHead>绑定用户</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>时长</TableHead>
              <TableHead>到期时间</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
            accounts.items?.map((acc) => (
              <TableRow key={acc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono">
                      {showAccount[acc.id] ? acc.accountId : `${acc.accountId.slice(0, 10)}...`}
                    </code>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAccount({
                              ...showAccount,
                              [acc.id]: !showAccount[acc.id]
                            })}
                          >
                            {showAccount[acc.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{showAccount[acc.id] ? '隐藏' : '显示'}账号</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await navigator.clipboard.writeText(acc.accountId);
                              setAccountCopied({ ...accountCopied, [acc.id]: true });
                              setTimeout(() => {
                                setAccountCopied({ ...accountCopied, [acc.id]: false });
                              }, 2000);
                            }}
                          >
                            {accountCopied[acc.id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{accountCopied[acc.id] ? '已复制' : '复制账号'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>{getPlanTypeBadge(acc.type)}</TableCell>
                <TableCell>{acc.deviceLimit}台设备</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Laptop className="h-4 w-4" />
                    {acc.deviceCount}/{acc.deviceLimit}
                    {acc.deviceCount === acc.deviceLimit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>设备数已达上限</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{acc.userEmail}</TableCell>
                <TableCell>{getStatusBadge(acc.status)}</TableCell>
                <TableCell>{acc.duration.replace('m', '个月')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {acc.expiresAt.toLocaleDateString()}
                    {acc.status === 'expiring' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Clock className="h-4 w-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>即将到期</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{acc.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Laptop className="h-4 w-4 mr-1" />
                      设备管理
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedAccount(acc);
                      setRenewDialogOpen(true);
                    }}>
                      续期
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
          </TableBody>
        </Table>
      </div>

      {/* 创建账号对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新的加速器账号</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">账号ID/链接</label>
                <Input 
                  {...form.register("accountId")}
                  placeholder="输入加速器账号ID或链接" 
                />
                {form.formState.errors.accountId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.accountId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">套餐类型</label>
                <Select  onValueChange={(value) => form.setValue("type", value)} 
                  defaultValue={form.getValues("type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择套餐类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">个人版 (2台设备)</SelectItem>
                    <SelectItem value="team">团队版 (5台设备)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">使用时长</label>
                <Select onValueChange={(value) => form.setValue("duration", value)}
                defaultValue={form.getValues("duration")}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择使用时长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1个月</SelectItem>
                    <SelectItem value="3m">3个月</SelectItem>
                    <SelectItem value="6m">6个月</SelectItem>
                    <SelectItem value="12m">12个月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
              <label className="text-sm font-medium">绑定用户</label>
                <Input type="email" placeholder="输入用户邮箱"  {...form.register("userEmail")} />
                {form.formState.errors.userEmail && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.userEmail.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '创建'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* 续期对话框 */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>续期加速器账号</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">当前账号</label>
              <div className="font-mono mt-1 text-sm">
                {selectedAccount?.accountIdentifier}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">当前使用情况</label>
              <div className="mt-1">
                <div className="text-sm">到期时间: {
                  selectedAccount?.expiresAt 
                    ? new Date(selectedAccount.expiresAt).toLocaleDateString() 
                    : '-'
                }</div>
                <div className="text-sm">设备使用: {selectedAccount?.deviceCount || 0}/{selectedAccount?.deviceLimit || 0}</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">续期时长</label>
              <Select 
                value={renewDuration}
                onValueChange={setRenewDuration}
                defaultValue="1m"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择续期时长" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1个月</SelectItem>
                  <SelectItem value="3m">3个月</SelectItem>
                  <SelectItem value="6m">6个月</SelectItem>
                  <SelectItem value="12m">12个月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRenewDialogOpen(false);
              setSelectedAccount(null);
            }}>
              取消
            </Button>
            <Button
              disabled={renewMutation.isPending}
              onClick={() => {
                if (selectedAccount) {
                  renewMutation.mutate({
                    serviceId: selectedAccount.id,
                    duration: renewDuration,
                  });
                }
              }}
            >
              {renewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '确认续期'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    );
};

export default AcceleratorManagement; 