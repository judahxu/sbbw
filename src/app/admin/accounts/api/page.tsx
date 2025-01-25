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
import { api } from "~/trpc/react";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
const ApiKeyManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showKey, setShowKey] = useState({});
  const [keyCopied, setKeyCopied] = useState({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [createForm, setCreateForm] = useState({
    platform: 'openai',
    apiKey: '',
    quota: '100k',
    userEmail: ''
  });
  const [topUpForm, setTopUpForm] = useState({
    quota: '100k'
  });
    const queryClient = useQueryClient();
  
  // API Queries
  const { data: apiKeys, isLoading } = api.apiKey.list.useQuery({
    search: searchQuery,
    status: filterStatus !== 'all' ? filterStatus : undefined
  });

  const { data: stats } = api.apiKey.getStats.useQuery();

  const createMutation = api.apiKey.create.useMutation();
  const topUpMutation = api.apiKey.topUp.useMutation();

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      depleted: 'bg-gray-100 text-gray-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    const labels = {
      active: '使用中',
      depleted: '已耗尽',
      warning: '异常'
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getPlatformBadge = (platform) => {
    const styles = {
      openai: 'bg-blue-100 text-blue-800',
      claude: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={styles[platform]}>{platform.toUpperCase()}</Badge>;
  };

  const formatTokens = (tokens) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };


  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        platform: createForm.platform,
        apiKey: createForm.apiKey,
        quota: createForm.quota,
        userEmail: createForm.userEmail
      });
      toast.success('API Key 创建成功');
      setCreateDialogOpen(false);
      setCreateForm({
        platform: 'openai',
        apiKey: '',
        quota: '100k',
        userEmail: ''
      });
      void queryClient.invalidateQueries({
        queryKey: [['apiKey', 'list']]  // 使用正确的查询键格式
      });
      void queryClient.invalidateQueries({
        queryKey: [['apiKey', 'getStats']]
      });
    } catch (error) {
      toast.error(error.message || '创建失败');
    }
  };

  const handleTopUp = async () => {
    try {
      await topUpMutation.mutateAsync({
        keyId: selectedKey.id,
        quota: topUpForm.quota
      });
      toast.success('充值成功');
      setTopUpDialogOpen(false);
      setSelectedKey(null);
      setTopUpForm({ quota: '100k' });
      void queryClient.invalidateQueries({
        queryKey: [['apiKey', 'list']]  // 使用正确的查询键格式
      });
      void queryClient.invalidateQueries({
        queryKey: [['apiKey', 'getStats']]
      });
    } catch (error) {
      toast.error(error.message || '充值失败');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">API Key管理</h1>
          <p className="text-gray-500">管理和监控API Key的使用配额</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Button className="bg-black" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建API Key
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总API Keys</CardTitle>
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
            <div className="text-2xl font-bold text-green-600">
              {stats?.active || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">配额即将耗尽</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.lowQuota || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">异常Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.warning || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索API Key或用户邮箱..."
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
            <SelectItem value="depleted">已耗尽</SelectItem>
            <SelectItem value="warning">异常</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="平台筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部平台</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API Key</TableHead>
              <TableHead>平台</TableHead>
              <TableHead>总配额</TableHead>
              <TableHead>已使用</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>绑定用户</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.items?.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono">
                        {showKey[key.id] ? key.apiKey : `${key.apiKey.slice(0, 8)}...`}
                      </code>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowKey({
                                ...showKey,
                                [key.id]: !showKey[key.id]
                              })}
                            >
                              {showKey[key.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showKey[key.id] ? '隐藏' : '显示'} API Key</p>
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
                                await navigator.clipboard.writeText(key.apiKey);
                                setKeyCopied({ ...keyCopied, [key.id]: true });
                                setTimeout(() => {
                                  setKeyCopied({ ...keyCopied, [key.id]: false });
                                }, 2000);
                              }}
                            >
                              {keyCopied[key.id] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{keyCopied[key.id] ? '已复制' : '复制 API Key'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>{getPlatformBadge(key.platform)}</TableCell>
                  <TableCell>{formatTokens(key.quotaLimit)} tokens</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {formatTokens(key.quotaUsed)} tokens
                      {key.quotaUsed / key.quotaLimit > 0.8 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>配额即将耗尽</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(key.status)}</TableCell>
                  <TableCell>{key.userEmail}</TableCell>
                  <TableCell>
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedKey(key);
                        setTopUpDialogOpen(true);
                      }}
                    >
                      充值
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新的API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">选择平台</label>
                <Select onValueChange={(value) => setCreateForm({...createForm, platform: value})} defaultValue={createForm.platform}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择API平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">API Key</label>
                <Input 
                  value={createForm.apiKey}
                  onChange={(e) => setCreateForm({...createForm, apiKey: e.target.value})}
                  placeholder="输入 API Key" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">初始配额</label>
                <Select onValueChange={(value) => setCreateForm({...createForm, quota: value})} defaultValue={createForm.quota}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择初始配额" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100k">10万 tokens</SelectItem>
                    <SelectItem value="500k">50万 tokens</SelectItem>
                    <SelectItem value="1m">100万 tokens</SelectItem>
                    <SelectItem value="5m">500万 tokens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">绑定用户</label>
                <Input type="email" placeholder="输入用户邮箱"  
                  value={createForm.userEmail}
                  onChange={(e) => setCreateForm({...createForm, userEmail: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '创建'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key充值</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">当前Key</label>
              <div className="font-mono mt-1 text-sm">
                {selectedKey?.apiKey.slice(0, 32)}...
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">当前使用情况</label>
              <div className="mt-1">
                <div className="text-sm">总配额: {selectedKey ? formatTokens(selectedKey.quotaLimit) : 0} tokens</div>
                <div className="text-sm">已使用: {selectedKey ? formatTokens(selectedKey.quotaUsed) : 0} tokens</div>
                <div className="text-sm">剩余: {selectedKey ? formatTokens(selectedKey.quotaLimit - selectedKey.quotaUsed) : 0} tokens</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">充值配额</label>
              <Select defaultValue="100k">
                <SelectTrigger>
                  <SelectValue placeholder="选择充值配额" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100k">10万 tokens</SelectItem>
                  <SelectItem value="500k">50万 tokens</SelectItem>
                  <SelectItem value="1m">100万 tokens</SelectItem>
                  <SelectItem value="5m">500万 tokens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 rounded-md bg-gray-50 p-3">
                <p>充值价格：</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>10万 tokens - ￥35</li>
                  <li>50万 tokens - ￥165</li>
                  <li>100万 tokens - ￥320</li>
                  <li>500万 tokens - ￥1500</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTopUpDialogOpen(false);
              setSelectedKey(null);
              setTopUpForm({ quota: '100k' });
            }}>
              取消
            </Button>
            <Button 
              disabled={topUpMutation.isPending}
              onClick={handleTopUp}
            >
              {topUpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '确认充值'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeyManagement;