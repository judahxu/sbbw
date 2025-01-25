'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  PencilIcon,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation,useQueryClient } from '@tanstack/react-query';
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDuration } from "~/lib/utils";

const accountFormSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(8, "密码至少8个字符"),
  platform: z.enum(["gpt", "claude"], {
    required_error: "请选择平台",
  }),
  type: z.enum(["permanent", "temporary"], {
    required_error: "请选择账号类型",
  }),
  plusDuration: z.string(),
  acceleratorDuration: z.string().optional(),
  assignedEmail: z.string().email("请输入有效的邮箱").optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

const PlusAccountManagement = () => {
  const [showPassword, setShowPassword] = useState({});
  const [passwordCopied, setPasswordCopied] = useState({});
  const [accountDialog, setAccountDialog] = useState({ 
    open: false, 
    type: 'add', 
    data: null 
  });
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // API 查询
  const { data: accountsData, isLoading } = api.serviceAccount.listPlus.useQuery(
    {
      search: searchQuery,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      page,
      pageSize,
    }
  );

  const { data: statsData } = api.serviceAccount.getPlusStats.useQuery();


  // 创建Plus账号
  const createMutation = api.serviceAccount.createPlus.useMutation({
    onSuccess: () => {
      toast.success('账号创建成功');
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'listPlus']]
      });
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'getPlusStats']]
      });
      setAccountDialog({ open: false, type: 'add', data: null });
      accountForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || '创建失败');
    }
  });

  // 更新Plus账号
  const updateMutation = api.serviceAccount.updatePlus.useMutation({
    onSuccess: () => {
      toast.success('更新成功');
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'listPlus']]
      });
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'getPlusStats']]
      });
      setAccountDialog({ open: false, type: 'add', data: null });
      accountForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || '更新失败');
    }
  });

  // 表单处理
  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      platform: 'gpt',
      type: 'permanent',
    }
  });

  // 状态样式
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expiring: 'bg-yellow-100 text-yellow-800',
      renewal: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      active: 'Plus活跃',
      expiring: '即将到期',
      renewal: '待续费'
    };
    
    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  useEffect(() => {
    if (accountDialog.type === 'edit' && accountDialog.data) {
      const account:AccountFormData = accountDialog.data;
      accountForm.reset({
        email: account.email,
        password: account.password,
        platform: account.platform,
        type: account.type,
        plusDuration: account.plusDuration,    // Plus时长
        acceleratorDuration: account.acceleratorDuration,  // 加速器时长
        assignedEmail: account.assignedEmail || '',  // 绑定用户
      });
    }
  }, [accountDialog.type, accountDialog.data, accountForm]);
  
  // 修改关闭对话框时的重置逻辑
  const handleCloseDialog = () => {
    setAccountDialog({ open: false, type: 'add', data: null });
    accountForm.reset({
      platform: 'gpt',
      type: 'permanent',
      email: '',
      password: '',
      plusDuration: '',
      acceleratorDuration: '',
      assignedEmail: '',
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* 页面标题和按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plus账号管理</h1>
          <p className="text-gray-500">管理Plus账号订阅和续费</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新状态
          </Button>
          <Button 
            className="bg-black"
            onClick={() => setAccountDialog({ open: true, type: 'add', data: null })}
          >
            <Plus className="w-4 h-4 mr-2" />
            新增账号
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Plus总账号</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.total ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">自动续费账号</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statsData?.autoRenewal ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsData?.newThisMonth ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statsData?.expiringSoon ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 过滤栏 */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索账号或用户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">Plus活跃</SelectItem>
            <SelectItem value="expiring">即将到期</SelectItem>
            <SelectItem value="renewal">待续费</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          高级筛选
        </Button>
      </div>

      {/* 账号列表 */}
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>账号</TableHead>
              <TableHead>密码</TableHead>
              <TableHead>平台</TableHead>
              <TableHead>账号类型</TableHead>
              <TableHead>Plus套餐</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>绑定用户</TableHead>
              <TableHead>Plus到期时间</TableHead>
              <TableHead>加速器时长</TableHead>
              <TableHead>加速器到期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsData?.items?.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword({
                        ...showPassword,
                        [account.id]: !showPassword[account.id]
                      })}
                    >
                      {showPassword[account.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <span className="font-mono">
                      {showPassword[account.id] ? account.password : '••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(account.password);
                        setPasswordCopied({ ...passwordCopied, [account.id]: true });
                        setTimeout(() => {
                          setPasswordCopied({ ...passwordCopied, [account.id]: false });
                        }, 2000);
                      }}
                    >
                      {passwordCopied[account.id] ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{account.platform}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {account.type === 'permanent' ? '永久' : '临时'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDuration(account.plusDuration)}</TableCell>
                <TableCell>{getStatusBadge(account.status)}</TableCell>
                <TableCell>{account.assignedEmail}</TableCell>
                <TableCell>{new Date(account.plusExpireAt).toLocaleDateString()}</TableCell>
                <TableCell>{account.acceleratorDuration}</TableCell>
                <TableCell>{account.acceleratorExpireAt ? new Date(account.acceleratorExpireAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAccountDialog({
                      open: true,
                      type: 'edit',
                      data: account
                    })}
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 账号表单对话框 */}
      <Dialog 
        open={accountDialog.open} 
        onOpenChange={(open) => {if (!open) handleCloseDialog();}}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {accountDialog.type === 'add' ? '新增Plus账号' : '编辑Plus账号'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={accountForm.handleSubmit((data) => {
            console.log(data);
            if (accountDialog.type === 'add') {
              createMutation.mutate(data);
            } else if (accountDialog.data?.id) {
              updateMutation.mutate({
                id: accountDialog.data.id,
                data
              });
            }
          })}>
            <div className="grid grid-cols-2 gap-4">
              {/* 基础信息 */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">账号邮箱</label>
                  <Input {...accountForm.register('email')} />
                </div>
                
                <div>
                  <label className="text-sm font-medium">账号密码</label>
                  <Input type="password" {...accountForm.register('password')} />
                </div>

                <div>
                  <label className="text-sm font-medium">平台</label>
                  <Select onValueChange={(value) => accountForm.setValue('platform', value as "gpt" | "claude")}
                     defaultValue={accountForm.getValues('platform')}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt">ChatGPT</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">账号类型</label>
                  <Select onValueChange={(value) => accountForm.setValue('type', value as "permanent" | "temporary")}
                     defaultValue={accountForm.getValues('type')}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择账号类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">永久账号</SelectItem>
                      <SelectItem value="temporary">临时账号</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Plus和加速器配置 */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Plus套餐</label>
                  <Select onValueChange={(value) => accountForm.setValue('plusDuration', value)}
                    defaultValue={accountForm.getValues('plusDuration') || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择套餐" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1个月Plus</SelectItem>
                      <SelectItem value="3m">3个月Plus</SelectItem>
                      <SelectItem value="6m">6个月Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">加速器时长</label>
                  <Select onValueChange={(value) => accountForm.setValue('acceleratorDuration', value)}
                    value={accountForm.watch('acceleratorDuration') || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择时长" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30天</SelectItem>
                      <SelectItem value="90d">90天</SelectItem>
                      <SelectItem value="180d">180天</SelectItem>
                      <SelectItem value="365d">365天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">绑定用户</label>
                  <Input 
                    type="email" 
                    placeholder="user@example.com"
                    {...accountForm.register('assignedEmail')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">备注</label>
                  <Input placeholder="可选备注信息" />
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {Object.keys(accountForm.formState.errors).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
                {Object.entries(accountForm.formState.errors).map(([key, error]) => (
                  <p key={key}>{error.message}</p>
                ))}
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setAccountDialog({ open: false, type: 'add', data: null })}
              >
                取消
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {accountDialog.type === 'add' ? '确认创建' : '保存修改'}
                {(createMutation.isPending || updateMutation.isPending) && (
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 分页控制 */}
      {accountsData && accountsData.items.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-500">
            共 {accountsData.total} 条数据
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              上一页
            </Button>
            <div className="text-sm">
              第 {page} 页，共 {Math.ceil(accountsData.total / pageSize)} 页
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(accountsData.total / pageSize)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlusAccountManagement;