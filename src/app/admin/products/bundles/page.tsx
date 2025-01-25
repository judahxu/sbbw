'use client'
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Settings, Eye, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import BundleEditDialog from './BundleEditDialog';
import type { BundleFormValues } from './BundleEditDialog';
import { useQueryClient } from '@tanstack/react-query';
import { api } from "~/trpc/react";

interface Bundle {
  id: string;
  name: string;
  description: string;
  accountType: 'permanent' | 'temporary';
  platform: 'chatgpt' | 'claude';
  plusDuration: 1 | 3 | 6 | null;
  acceleratorDuration: 7 | 15 | 30 | 90 | 180 | 365 | null;
  features: Array<{
    label: string;
    included: boolean;
  }>;
  originalPrice: number;
  salePrice: number;
  tag: string | null;
  status: 'active' | 'inactive';
}

const BundleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>();
  const { toast } = useToast();

  const [page, setPage] = useState(1);

   // 处理搜索
  //  const filteredBundles = bundles.filter(bundle =>
  //   bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   bundle.description.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // 查询套餐列表
  const { data: bundlesData, isLoading } = api.bundle.list.useQuery({
    search: searchQuery,
    page,
    pageSize: 10,
  });


const queryClient = useQueryClient();

// 创建套餐
const createMutation = api.bundle.create.useMutation({
  onSuccess: () => {
    toast({
      title: "创建成功",
      description: "新套餐已创建"
    });
    void queryClient.invalidateQueries({ queryKey: [['bundle', 'list']] });
    void queryClient.invalidateQueries({ queryKey: [['bundle', 'getStats']] });
    setEditDialogOpen(false);
  },
  onError: (error) => {
    toast({
      title: "创建失败", 
      description: error.message,
      variant: "destructive"
    });
  }
});

// 更新套餐
const updateMutation = api.bundle.update.useMutation({
  onSuccess: () => {
    toast({
      title: "更新成功",
      description: "套餐信息已更新"
    });
    void queryClient.invalidateQueries({ queryKey: [['bundle', 'list']] });
    setEditDialogOpen(false);
  },
  onError: (error) => {
    toast({
      title: "更新失败",
      description: error.message,
      variant: "destructive" 
    });
  }
});

// 修改状态
const updateStatusMutation = api.bundle.updateStatus.useMutation({
  onSuccess: () => {
    toast({
      title: "状态更新成功"
    });
    void queryClient.invalidateQueries({ queryKey: [['bundle', 'list']] });
    void queryClient.invalidateQueries({ queryKey: [['bundle', 'getStats']] });
  }
});



  // 处理表单提交
  const handleSubmit = async (data: BundleFormValues) => {
    console.log('handleSubmit', data);
    const bundleData = {
      ...data,
      originalPrice: Number(data.originalPrice),
      salePrice: Number(data.salePrice)
    };
    if(selectedBundle) {
      updateMutation.mutate({
        id: selectedBundle.id,
        data:bundleData
      });
    } else {
      createMutation.mutate(bundleData);
    }
  };

  // 处理状态切换
  const handleStatusToggle = async (bundle: Bundle) => {
    updateStatusMutation.mutate({
     id: bundle.id,
     status: bundle.status === 'active' ? 'inactive' : 'active'
   });
  };

  // 获取状态标签样式
  const getStatusBadge = (status: Bundle['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '已上架',
      inactive: '已下架',
    };
    
    return (
      <Badge 
        className={`cursor-pointer ${styles[status]}`}
        onClick={(e) => {
          e.stopPropagation();
          handleStatusToggle(bundle);
        }}
      >
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">套餐管理</h1>
          <p className="text-gray-500">管理推荐套餐配置</p>
        </div>
        <Button className="bg-black" onClick={() => {
          setSelectedBundle(null);
          setEditDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          新增套餐
        </Button>
      </div>

      {/* 搜索区 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="搜索套餐名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 套餐列表 */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>套餐名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>账号类型</TableHead>
                <TableHead>加速器</TableHead>
                <TableHead>Plus时长</TableHead>
                <TableHead>原价</TableHead>
                <TableHead>优惠价</TableHead>
                <TableHead>特色标签</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={10} className="text-center">
                   <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
             ) : bundlesData.items?.map((bundle) => (
                <TableRow key={bundle.id}>
                  <TableCell className="font-medium">{bundle.name}</TableCell>
                  <TableCell>{bundle.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bundle.accountType === 'permanent' ? '永久' : '临时'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bundle.acceleratorDuration?.replace('d', '天') || '-'}
                  </TableCell>
                  <TableCell>
                    {bundle.plusDuration?.replace('m', '个月') || '-'}
                  </TableCell>
                  <TableCell>¥{bundle.originalPrice}</TableCell>
                  <TableCell>¥{bundle.salePrice}</TableCell>
                  <TableCell>
                    {bundle.tag && (
                      <Badge className="bg-orange-100 text-orange-800">
                        {bundle.tag}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(bundle.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedBundle(bundle);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
            </TableBody>
          </Table>
          {/* {!isLoading && bundlesData.items?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无套餐数据
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* TODO: 添加编辑弹窗组件 */}
      <BundleEditDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        bundle={selectedBundle}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BundleManagement;