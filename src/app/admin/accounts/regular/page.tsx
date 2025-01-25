'use client'
import React, { useState,useEffect } from 'react';
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
  Upload,
  Eye,
  EyeOff,
  Copy,
  RotateCw,
  Check,
  AlertTriangle,
  Plus,
  RefreshCw,
  PencilIcon,
  Loader
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "~/trpc/react"; // tRPC API client
import { toast } from "sonner"; // 提示组件
import { z } from "zod"; // 表单验证
import { useForm } from "react-hook-form"; // 表单处理
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
  bundleType: z.string(),
  temporaryDuration: z.string().optional().nullable(),
  hasAccelerator: z.boolean().default(false),
  acceleratorDuration: z.string().optional().nullable(),
  hasPlusSubscription: z.boolean().default(false),
  plusDuration: z.string().optional().nullable(),
  assignedEmail: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }, "请输入有效的邮箱"),

  
});

type AccountFormData = z.infer<typeof accountFormSchema>;

const AccountManagement = () => {
  const [showPassword, setShowPassword] = useState({});
  const [passwordCopied, setPasswordCopied] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, accountId: null });
  const [accountDialog, setAccountDialog] = useState({ 
    open: false, 
    type: 'add', // 'add' | 'edit'
    data: null 
  });

  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 获取账号列表
  const { data: accountsData, isLoading } = api.serviceAccount.list.useQuery(
    {
      search: searchQuery,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      page,
      pageSize,
    },
    {
      staleTime: 5000, // 数据在5秒内被认为是新鲜的
    }
  );
  // 获取统计数据
  const { data: statsData } = api.serviceAccount.getStats.useQuery();


  // 创建账号
  const createMutation = api.serviceAccount.create.useMutation({
    onSuccess: () => {
      toast.success('账号创建成功');
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'list']]  // 使用正确的查询键格式
      });
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'getStats']]
      });
      setAccountDialog({ open: false, type: 'add', data: null });
      accountForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || '创建失败');
    }
  });
  // 更新账号
  const updateMutation = api.serviceAccount.update.useMutation({
    onSuccess: () => {
      toast.success('更新成功');
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'list']]
      });
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'getStats']]
      });
      setAccountDialog({ open: false, type: 'add', data: null });
      accountForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || '更新失败');
    }
  });

  // 重置密码
  const resetPasswordMutation = api.serviceAccount.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success('密码重置成功');
      if (data.newPassword) {
        toast.info(`新密码: ${data.newPassword}`);
      }
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'list']]
      });
      setResetPasswordDialog({ open: false, accountId: null });
    },
    onError: (error) => {
      toast.error(error.message || '重置失败');
    }
  });

  // 批量导入
  const importMutation = api.serviceAccount.import.useMutation({
    onSuccess: (data) => {
      toast.success(`成功导入 ${data.count} 个账号`);
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'list']]
      });
      void queryClient.invalidateQueries({
        queryKey: [['serviceAccount', 'getStats']]
      });
      setImportDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || '导入失败');
    }
  });
  // 账号表单处理
  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: accountDialog.data ? {
      email: accountDialog.data.email,
      platform: accountDialog.data.platform,
      type: accountDialog.data.type,
    } : {
      platform: 'gpt',
      type: 'permanent',
    }
  });

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // 重置页码
  };

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setPage(1); // 重置页码
  };

  // 处理账号表单提交
const handleAccountSubmit = (data: AccountFormData) => {
    console.log('handleAccountSubmit', data);
    if (accountDialog.type === 'add') {
      createMutation.mutate(data);
    } else if (accountDialog.data?.id) {
      updateMutation.mutate({
        id: accountDialog.data.id,
        data
      });
    }
  };

  // 处理文件导入
  const handleFileImport = async (file: File) => {
    try {
      const content = await file.text();
      const accounts = parseCSV(content); // 实现 CSV 解析
      importMutation.mutate(accounts);
    } catch (error) {
      toast.error('文件解析失败');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      in_stock: 'bg-blue-100 text-blue-800',
      assigned: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      in_stock: '库存中',
      assigned: '已分配',
      expired: '已过期'
    };
    
    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  const watchAccountType = accountForm.watch("type");
  const watchHasPlusSubscription = accountForm.watch("hasPlusSubscription");

  const handleCloseDialog = () => {
    setAccountDialog({ open: false, type: 'add', data: null });
    accountForm.reset({
      platform: 'gpt',
      type: 'permanent',
      hasAccelerator: false,
      hasPlusSubscription: false,
      email: '',
      password: '',
      bundleType: '',
      temporaryDuration: null,
      acceleratorDuration: null,
      plusDuration: null
    });
  };

  // 在组件中添加这个 useEffect
  useEffect(() => {
    if (accountDialog.type === 'edit' && accountDialog.data) {
      const account:AccountFormData = accountDialog.data;
      accountForm.reset({
        email: account.email,
        password: account.password,
        platform: account.platform,
        type: account.type,
        bundleType: account.bundleType || '',
        // 检查是否有加速器配置
        hasAccelerator: !!account.acceleratorDuration,
        acceleratorDuration: account.acceleratorDuration || null,
        // 检查是否有Plus订阅
        hasPlusSubscription: !!account.plusDuration,
        plusDuration: account.plusDuration || null,
        // 临时账号相关
        temporaryDuration: account.temporaryDuration || null,
      });
    }
  }, [accountDialog]);

  return (
    <div className="container mx-auto p-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">账号管理</h1>
          <p className="text-gray-500">管理账号库存和分配状态</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setAccountDialog({ 
              open: true, 
              type: 'add', 
              data: null 
            })}
            className="bg-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加账号
          </Button>
          <Button 
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            导入账号
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
            <div className="text-2xl font-bold">{statsData?.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">可用库存</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statsData?.inStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">使用中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsData?.assigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statsData?.expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      {/* 过滤器 */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索账号或用户..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="in_stock">库存中</SelectItem>
            <SelectItem value="assigned">已分配</SelectItem>
            <SelectItem value="expired">已过期</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          高级筛选
        </Button>
      </div>

      {/* 账号列表 */}
      <div className="bg-white rounded-md border">
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader />
        </div>
      ) : (<Table>
          <TableHeader>
            <TableRow>
              <TableHead>账号</TableHead>
              <TableHead>平台</TableHead>
              <TableHead>账号类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>密码</TableHead>
              <TableHead>绑定用户</TableHead>
              <TableHead>套餐类型</TableHead>
              <TableHead>临时账号</TableHead>
              <TableHead>加速器</TableHead>
              <TableHead>Plus订阅</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsData?.items?.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{account.platform}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {account?.type === 'permanent' ? '永久' : '临时'}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(account.status)}</TableCell>
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
                <TableCell>{account.assignedEmail  || '-'}</TableCell>
                <TableCell>{account.bundleType || '-'}</TableCell>
                <TableCell>
                  {account.type === 'temporary' && (
                    <div className="space-y-1">
                      <div>时长: {formatDuration(account.temporaryDuration)}</div>
                      <div>到期: {account.temporaryExpireAt?.toLocaleDateString()}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {account.acceleratorDuration && (
                    <div className="space-y-1">
                      <div>时长: {formatDuration(account.acceleratorDuration)}</div>
                      <div>到期: {account.acceleratorExpireAt?.toLocaleDateString()}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {account.plusDuration && (
                    <div className="space-y-1">
                      <div>时长: {formatDuration(account.plusDuration)}</div>
                      <div>到期: {account.plusExpireAt?.toLocaleDateString()}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetPasswordDialog({
                        open: true,
                        accountId: account.id
                      })}
                    >
                      <RotateCw className="w-4 h-4 mr-1" />
                      重置密码
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      </div>
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
      {/* 导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入账号</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center" 
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileImport(file);
                }}
                onDragOver={(e) => e.preventDefault()}>
              <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-500">
                拖拽文件到此处，或点击选择文件
              </p>
              <input type="file" className="hidden"  
                accept=".csv,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileImport(file);
                }} />
            </div>
            <p className="text-sm text-gray-500">
              支持 .csv, .xlsx 格式，请按照模板格式导入
            </p>
            {/* <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                取消
              </Button>
              <Button>开始导入</Button>
            </DialogFooter> */}
          </div>
        </DialogContent>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => !open && setResetPasswordDialog({ open, accountId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置账号密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">新密码</label>
              <div className="flex gap-2 mt-1">
                <Input placeholder="输入或自动生成新密码"  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                {/* <Button variant="outline">生成</Button> */}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">重置原因</label>
              <Input placeholder="请输入重置原因" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordDialog({ open: false, accountId: null })}>
                取消
              </Button>
              <Button  onClick={() => resetPasswordDialog.accountId && resetPasswordMutation.mutate({
                  id: resetPasswordDialog.accountId,
                  password: newPassword
                })}
                disabled={resetPasswordMutation.isPending}>确认重置</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 账号表单对话框 */}
      <Dialog 
        open={accountDialog.open} 
        onOpenChange={(open) => {if (!open) handleCloseDialog();}}
      >
        <DialogContent className="max-w-2xl">
        <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {accountDialog.type === 'add' ? '添加账号' : '编辑账号'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">平台</label>
                <Select  onValueChange={(value) => accountForm.setValue('platform', value as "gpt" | "claude")}
                  defaultValue={accountForm.getValues('platform')}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt">ChatGPT</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
                {accountForm.formState.errors.platform && (
                  <p className="text-sm text-red-500">
                    {accountForm.formState.errors.platform.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">账号类型</label>
                <Select  onValueChange={(value) => {
                    accountForm.setValue('type', value as "permanent" | "temporary");
                    if (value === 'permanent') {
                      accountForm.setValue('temporaryDuration', null);
                    }
                  }}
                  defaultValue={accountForm.getValues('type')}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择账号类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">永久账号</SelectItem>
                    <SelectItem value="temporary">临时账号</SelectItem>
                  </SelectContent>
                </Select>
                {accountForm.formState.errors.type && (
                  <p className="text-sm text-red-500">
                    {accountForm.formState.errors.type.message}
                  </p>
                )}
              </div>
            </div>

            {/* 账号信息 */}
            {accountDialog.type === 'add' && (<div className="space-y-4">
              <div>
                <label className="text-sm font-medium">账号邮箱</label>
                <Input placeholder="请输入账号邮箱" {...accountForm.register('email')} />
                {accountForm.formState.errors.email && (
                  <span className="text-sm text-red-500">
                    {accountForm.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">账号密码</label>
                <div className="flex gap-2">
                  <Input type="password" placeholder="输入或自动生成密码"  {...accountForm.register('password')} />
                  {/* <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    生成
                  </Button> */}
                   {accountForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {accountForm.formState.errors.password.message}
                      </p>
                    )}
                </div>
              </div>
            </div>)}
            <div>
              <label className="text-sm font-medium">绑定用户邮箱</label>
              <Input 
                type="email"
                placeholder="请输入要绑定的邮箱" 
                {...accountForm.register('assignedEmail')}
              />
              {accountForm.formState.errors.assignedEmail && (
                <p className="text-sm text-red-500">
                  {accountForm.formState.errors.assignedEmail.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">套餐类型</label>
              <div className="flex gap-2">
                <Input placeholder="请输入套餐类型"  {...accountForm.register('bundleType')} />
                  {accountForm.formState.errors.bundleType && (
                    <p className="text-sm text-red-500">
                      {accountForm.formState.errors.bundleType.message}
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasAccelerator"
                checked={accountForm.watch('hasAccelerator')}
                onCheckedChange={(checked) => {
                  accountForm.setValue('hasAccelerator', checked as boolean);
                  if (!checked) {
                    accountForm.setValue('acceleratorDuration', null);
                  }
                }}
              />
              <label htmlFor="hasAccelerator" className="text-sm font-medium">
                启用加速器
              </label>
            </div>
            {/* 加速器时长 */}
            {accountForm.watch('hasAccelerator') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">加速器时长</label>
                <Select
                  onValueChange={(value) => accountForm.setValue('acceleratorDuration', value)}
                  value={accountForm.watch('acceleratorDuration') || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择加速器时长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30d">30天</SelectItem>
                    <SelectItem value="90d">90天</SelectItem>
                    <SelectItem value="180d">180天</SelectItem>
                    <SelectItem value="365d">365天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Plus开关 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPlusSubscription"
                checked={watchHasPlusSubscription}
                onCheckedChange={(checked) => {
                  accountForm.setValue('hasPlusSubscription', checked as boolean);
                  if (!checked) {
                    accountForm.setValue('plusDuration', null);
                  }
                }}
              />
              <label 
                htmlFor="hasPlusSubscription" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                启用 Plus 订阅
              </label>
            </div>
            {/* 使用期限 - 仅临时账号显示 */}
            {watchAccountType === 'temporary' && !watchHasPlusSubscription && (
              <div className="space-y-2">
                <label className="text-sm font-medium">使用期限</label>
                <Select
                  onValueChange={(value) => {
                    accountForm.setValue('temporaryDuration', value); 
                    accountForm.setValue('plusDuration', null);
                  }}
                  defaultValue={accountForm.getValues('temporaryDuration') || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择使用期限" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7天</SelectItem>
                    <SelectItem value="15d">15天</SelectItem>
                    <SelectItem value="30d">30天</SelectItem>
                  </SelectContent>
                </Select>
                {accountForm.formState.errors.temporaryDuration && (
                  <p className="text-sm text-red-500">
                    {accountForm.formState.errors.temporaryDuration.message}
                  </p>
                )}
              </div>
            )}
            {/* Plus订阅时长 */}
            {watchHasPlusSubscription && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Plus订阅时长</label>
                <Select
                  onValueChange={(value) => {
                    accountForm.setValue('plusDuration', value)
                    if (accountForm.getValues('type') == 'temporary') {
                      accountForm.setValue('temporaryDuration', value);
                    }
                  }}
                  defaultValue={accountForm.getValues('plusDuration') || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择订阅时长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1个月</SelectItem>
                    <SelectItem value="3m">3个月</SelectItem>
                    <SelectItem value="12m">12个月</SelectItem>
                  </SelectContent>
                </Select>
                {accountForm.formState.errors.plusDuration && (
                  <p className="text-sm text-red-500">
                    {accountForm.formState.errors.plusDuration.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAccountDialog({ open: false, type: 'add', data: null })}
              >
                取消
              </Button>
              <Button type="submit" disabled={
                createMutation.isPending || updateMutation.isPending
              }>
                {accountDialog.type === 'add' ? '添加账号' : '保存修改'}
              </Button>
            </DialogFooter>
          </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountManagement;